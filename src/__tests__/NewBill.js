/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import { ROUTES } from '../constants/routes'

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
      newBill = new NewBill({document, onNavigate, store: null, localStorage: window.localStorage})

    })
  describe('And I upload an image file', () => { 
    test('Then the file extension is correct', () => {
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile)
      const inputFile = screen.queryByTestId('file')

      inputFile.addEventListener('change', handleChangeFile)

      fireEvent.change(inputFile, {
        target: {
          files: [new File(['test.jpg'], 'test.jpg', { type: 'image/jpg' })],
        },
      })

      const error = screen.queryByTestId('errorMessage')
      expect(error).toBeFalsy
    })
    test('Then the file extension is incorrect', () => {    
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile)
      const inputFile = screen.queryByTestId('file')

      inputFile.addEventListener('change', handleChangeFile)

      fireEvent.change(inputFile, {
        target: {
          files: [
            new File(['test'], 'test.txt', {
              type: 'text/plain',
            }),
          ],
        },
      })

      const error = screen.queryByTestId('errorMessage')
      expect(error).toBeTruthy
    })
  })
  describe('When I submit a valid bill', () => {
    test('Then a bill is created', () =>{
      const submit = screen.queryByTestId('form-new-bill')
      const billTest = {
        name: 'Test-Bill',
        pct: 10,
        vat: 10,
        date: '2022-07-13',
        amount: 180,
        commentary: 'test de test',
        type: 'Bar',
        fileName: 'testBill',
        fileUrl: 'testBill.jpg',
      };
  
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
  
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
  
      submit.addEventListener('click', handleSubmit)
  
      fireEvent.click(submit)
  
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
})
