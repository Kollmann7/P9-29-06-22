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

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})
window.localStorage.setItem(
  'user',
  JSON.stringify({
    type: 'Employee',
  })
)

describe('Given I am an employee', () => {
  describe('When I navigate to the dashboard', () => {
    test('When I click on the new bill button then a modal should open', () => {
      
      document.body.innerHTML = BillsUI({ data: bills })

      const bill = new Bills({document,onNavigate,store: null,bills,localStorage: window.localStorage})
      $.fn.modal = jest.fn()

      const handleClickNewBill = jest.fn((e) => bill.handleClickNewBill)

      const iconNewBill = screen.getByTestId('btn-new-bill')
      iconNewBill.addEventListener('click', handleClickNewBill)
      fireEvent.click(iconNewBill)

      expect(handleClickNewBill).toHaveBeenCalled()

      const modale = screen.getByTestId('form-new-bill')
      expect(modale).toBeTruthy()
    
    })
    test('When i click on the eye icon of the bill then a modal sould open', () =>{
      
      document.body.innerHTML = BillsUI({ data: bills })
      const bill = new Bills({document,onNavigate,store: null,bills,localStorage: window.localStorage})
      $.fn.modal = jest.fn();

      const iconEye = screen.getAllByTestId('icon-eye')
      
      const handleClickIconEye = jest.fn((e) =>
        bill.handleClickIconEye(iconEye[0])
      )

      iconEye[0].addEventListener('click', handleClickIconEye)
      fireEvent.click(iconEye[0])

      expect(handleClickIconEye).toHaveBeenCalled()

      const modale = screen.getByTestId('modaleFile')
      expect(modale).toBeTruthy()
    })  
  })
})  