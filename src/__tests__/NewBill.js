/**
 * @jest-environment jsdom
 */

import { screen, fireEvent  } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import { ROUTES } from '../constants/routes'
import mockStore from '../__mocks__/store'
import { bills } from '../fixtures/bills.js'
import userEvent from "@testing-library/user-event"


const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
window.localStorage.setItem(
  'user',
  JSON.stringify({
    type: 'Employee',
  })
)


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the newBill should be rendered", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy()
    })
  })
})

describe("When I'm on NewBill Page", () => {
  let newBill 
    beforeEach( () => {
      document.body.innerHTML = NewBillUI()
      
      newBill = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage})

    })
  describe('And I upload an image file', () => { 
    test('Then the file extension is correct', () => {

      const submit = screen.queryByTestId('form-new-bill')
      const spy = jest.spyOn(newBill, 'handleChangeFile')

      const inputFile = screen.queryByTestId('file')


      fireEvent.change(inputFile, {
        target: {
          files: [new File(['test.jpg'], 'test.jpg', { type: 'image/jpg' })],
        },
      })

      fireEvent.click(submit)

      expect(spy).toHaveBeenCalled()
      expect(inputFile.files[0].name).toBe('test.jpg')
      expect(inputFile.files).toHaveLength(1)



    })
    test('Then the file extension is incorrect', () => {
      const submit = screen.queryByTestId('form-new-bill')
      const spy = jest.spyOn(newBill, 'handleChangeFile')

      const inputFile = screen.queryByTestId('file')


      fireEvent.change(inputFile, {
        target: {
          files: [new File(['test'], 'test.txt', {type: 'text/plain',})]
        },
      })

      fireEvent.click(submit)

      expect(spy).toHaveBeenCalled()
      expect(inputFile.files[0].name).toBe('test.txt')
      expect(inputFile.value).toBe('')

      const error = screen.queryByTestId('errorMessage')
      expect(error).toBeTruthy()
    })
  })
  describe('When I am on NewBill page, I filled in the form correctly and I clicked on submit button', () => {
    test('Then Bills page should be rendered', () => {
      const handleSubmit = jest.spyOn(newBill, 'handleSubmit')

      const formNewBill = screen.getByTestId('form-new-bill')

      fireEvent.submit(formNewBill)

      expect(handleSubmit).toHaveBeenCalled()

      expect(screen.getByText('Mes notes de frais')).toBeTruthy()
    })
  })
  describe('When I submit a valid bill', () => {
    test('Then it should create a new bill', () =>{
      const spy = jest.spyOn(newBill, 'handleSubmit')

      const email = JSON.parse(localStorage.getItem('user')).email

      const billTest = {
        email,
        name: 'Test-Bill',
        pct: 10,
        vat: 10,
        date: '2022-07-13',
        amount: 180,
        commentary: 'test de test',
        type: 'Bar',
        fileName: 'testBill',
        fileUrl: 'testBill.jpg',
      }
    
      newBill.createBill = (newBill) => newBill
  
      document.querySelector(`input[data-testid="expense-name"]`).value = billTest.name
      document.querySelector(`input[data-testid="pct"]`).value = billTest.pct
      document.querySelector(`input[data-testid="vat"]`).value = billTest.vat
      document.querySelector(`input[data-testid="datepicker"]`).value = billTest.date
      document.querySelector(`input[data-testid="amount"]`).value = billTest.amount
      document.querySelector(`textarea[data-testid="commentary"]`).value = billTest.commentary
      document.querySelector(`select[data-testid="expense-type"]`).value = billTest.type  
      newBill.fileUrl = billTest.fileUrl
      newBill.fileName = billTest.fileName
  
      const btn = screen.getByRole('button')

      userEvent.click(btn)      
      expect(spy).toHaveBeenCalled()

    })
  })
})


describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill page and submit a valid form', () => {
    let newBill
    let mockbill
    beforeEach( () => {
      document.body.innerHTML = NewBillUI()

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      newBill = new NewBill({document, onNavigate,store: mockStore,localStorage: null })

      mockbill = {
        name: '',
        pct: 10,
        vat: 10,
        date: '2022-07-13',
        amount: 180,
        commentary: 'test de test',
        type: 'Bar',
        fileName: 'testBill',
        fileUrl: '',
      }

    })
    
    
    test('Then a new bill should be stored in the API', async () => {
      const inputFile = screen.queryByTestId('file')
      
      userEvent.upload(inputFile,new File(['test'],'test.jpg', { type: 'image/jpg' }))
      await new Promise(process.nextTick)
      expect(newBill.billId).toBe('1234')
      expect(newBill.fileUrl).toBe('https://localhost:3456/images/test.jpg')
      
    })
  })
  describe('When an error occurs on API', () => {
    let newBill
    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: 'a@a',
        })
      )

      document.body.innerHTML = NewBillUI()

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname, data: bills })
      }
      newBill = new NewBill({ document,onNavigate,store: mockStore,bills: bills,localStorage: window.localStorage,})
    })

    test('Then new bill are fetch from API but fails with 404 message error', async () => {
      const spyedMockStore = jest.spyOn(mockStore, 'bills')

      spyedMockStore.mockImplementationOnce(() => {
        return {
          create: jest.fn().mockRejectedValue(new Error('Erreur 404')),
        }
      })
      
      const inputFile = screen.queryByTestId('file')

      userEvent.upload(inputFile,new File(['test'],'test.txt', { type: 'image/txt' }))

      await spyedMockStore()

      expect(spyedMockStore).toHaveBeenCalled()

      expect(newBill.billId).toBeNull()
      expect(newBill.fileUrl).toBeNull()
    })
    test('Then new bill are fetch from API but fails with 500 message error', async () => {
      const spyedMockStore = jest.spyOn(mockStore, 'bills')

      spyedMockStore.mockImplementationOnce(() => {
        return {
          create: jest.fn().mockRejectedValue(new Error('Erreur 500')),
        }
      })

      const inputFile = screen.queryByTestId('file')

      userEvent.upload(inputFile,new File(['test'],'test.txt', { type: 'image/txt' }))

      await spyedMockStore()

      expect(spyedMockStore).toHaveBeenCalled()

      expect(newBill.billId).toBeNull()
      expect(newBill.fileUrl).toBeNull()
    })
  })
})