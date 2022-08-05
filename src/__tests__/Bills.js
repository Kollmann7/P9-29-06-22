/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import { ROUTES } from '../constants/routes'
import {fireEvent} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import Bills from '../containers/Bills.js'
import mockStore from '../__mocks__/store'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import router from "../app/Router.js"
jest.mock('../app/store', () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.className).toBe('active-icon')

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})


describe('Given I am an employee', () => {
  describe('When I navigate to the dashboard', () => {
    let bill
    beforeEach(() => {
      document.body.innerHTML = BillsUI({ data: bills })

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      bill = new Bills({document,onNavigate,store: null,bills,localStorage: window.localStorage})
      $.fn.modal = jest.fn()
    })
    test('When I click on the new bill button then a modal should open', () => {
      
      const spy = jest.spyOn( bill, 'handleClickNewBill')
      const iconNewBill = screen.getByTestId('btn-new-bill')
      userEvent.click(iconNewBill)
      expect(spy).toHaveBeenCalled()
      const modale = screen.getByTestId('form-new-bill')
      expect(modale).toBeTruthy()


    })
    test('When i click on the eye icon of the bill then a modal sould open', () =>{
      
      const spy = jest.spyOn(bill, 'handleClickIconEye')
      
      const iconEye = screen.getAllByTestId('icon-eye')
      fireEvent.click(iconEye[0])

      const eyeIcons = screen.getAllByTestId('icon-eye')
      userEvent.click(eyeIcons[0])

      expect(spy).toHaveBeenCalled()

      const modale = screen.getByTestId('modaleFile')
      expect(modale).toBeTruthy()
    })  
  })
})  

describe('Given I am a user connected as Employee', () => {
  describe('When I navigate to Bills Page', () => {
    test('Then the bills are fetched from the simulated API GET', async () => {
      localStorage.setItem(
        'user',
        JSON.stringify({ type: 'Employee', email: 'a@a' })
      )

      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText('Mes notes de frais'))
      const newBillButton = screen.getByText('Nouvelle note de frais')
      expect(newBillButton).toBeTruthy()

    })
    describe('When an error occurs on API', () => {
      beforeEach(() => {
        jest.spyOn(mockStore, 'bills')
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem(
          'user',
          JSON.stringify({
            type: 'Employee',
            email: 'a@a',
          })
        )
        const root = document.createElement('div')
        root.setAttribute('id', 'root')
        document.body.appendChild(root)
        router()
      })
      test('fetches bills from an API and fails with 404 message error', async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error('Erreur 404'))
            },
          }
        })
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick)
        const message = screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })
    })
    test('fetches messages from an API and fails with 500 message error', async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error('Erreur 500'))
          },
        }
      })
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick)
      const message = screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})
