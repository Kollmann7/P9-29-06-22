/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js"



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
  describe('And I upload an image file', () => {
    test('Then the file extension is correct', () => {
      document.body.innerHTML = NewBillUI()
      const newBill = new NewBill({document, onNavigate, store: null, localStorage: window.localStorage})

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
      document.body.innerHTML = NewBillUI()
      const newBill = new NewBill({document, onNavigate, store: null, localStorage: window.localStorage})

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
})

