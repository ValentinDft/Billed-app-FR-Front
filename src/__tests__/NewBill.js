/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const iconMail = screen.getByTestId("icon-mail");
      const activeIcon = iconMail.classList.contains("active-icon");
      expect(activeIcon).toBeTruthy();
    });
  });
  describe("When I am on NewBill Page and I add a image file", () => {
    test("Should return success on upload", () => {
      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.spyOn(newBill, "handleChangeFile");
      const fileInput = screen.getByTestId("file");
      global.alert = jest.fn();
      fileInput.addEventListener("change", handleChangeFile);

      fireEvent.change(fileInput, {
        target: {
          files: [
            new File(["image"], "image.jpg", {
              type: "image/jpg",
            }),
          ],
        },
      });
      expect(handleChangeFile).toHaveBeenCalledTimes(1);
    });
  });
  describe("When I am on NewBill Page and I add a document file", () => {
    test("Should return error on upload", () => {
      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.spyOn(newBill, "handleChangeFile");
      const fileInput = screen.getByTestId("file");
      global.alert = jest.fn();
      fileInput.addEventListener("change", handleChangeFile);

      fireEvent.change(fileInput, {
        target: {
          files: [
            new File(["document"], "document.pdf", {
              type: "application/pdf",
            }),
          ],
        },
      });
      expect(handleChangeFile).toHaveBeenCalledTimes(1);
      expect(global.alert).toBeTruthy();
    });
  });
  describe("When I am on NewBill Page and I submit the complete form", () => {
    test("Then the bills should add to API POST", async () => {
      const spyBills = jest.spyOn(mockStore, "bills");
      const billTest = {
        email: "employee@test.tld",
        type: "Restaurants et bars",
        name: "Courtepaille diner business",
        amount: 73,
        date: "2023-01-20",
        vat: 70,
        pct: 20,
        commentary: "Diner business avec un client",
        fileUrl: "facture.png",
        fileName: "facture",
        status: "pending",
      };
      const addedBill = await mockStore.bills().create(billTest);
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      const handleSubmit = jest.fn(newBill.handleSubmit);
      const newBillForm = screen.getByTestId("form-new-bill");
      const submitButton = screen.getByRole("button", { name: /envoyer/i });

      newBillForm.addEventListener("submit", handleSubmit);
      userEvent.click(submitButton);

      expect(submitButton.type).toBe("submit");
      expect(handleSubmit).toHaveBeenCalled();
      expect(spyBills).toHaveBeenCalled();
      expect(addedBill.key).toBe("1234");
    });
  });
});
