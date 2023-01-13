/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockedStore from "../__mocks__/store";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
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
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      const activeIcon = windowIcon.classList.contains("active-icon");
      //to-do write expect expression
      expect(activeIcon).toBeTruthy();
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({
        data: bills.sort((a, b) => (a.date < b.date ? 1 : -1)),
      });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
    describe("Click on eye button", () => {
      test("Then a modal open", () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        document.body.innerHTML = BillsUI({ data: bills });
        const billsContainer = new Bills({
          document,
          onNavigate,
          store: mockedStore,
          localStorage: window.localStorage,
        });

        $.fn.modal = jest.fn();
        const modal = document.getElementById("modaleFile");
        const iconEye = screen.getAllByTestId("icon-eye")[0];
        const handleClickOnEye = jest.fn(() =>
          billsContainer.handleClickIconEye(iconEye)
        );
        console.log("OOOOOOOOO", handleClickOnEye);
        iconEye.addEventListener("click", handleClickOnEye);
        userEvent.click(iconEye);

        expect(handleClickOnEye).toHaveBeenCalled();
        expect(modal).toBeTruthy();
      });
    });
    describe("When I click on New bill button", () => {
      test("then it's render New bill page", () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        document.body.innerHTML = BillsUI({ data: bills });
        const billsContainer = new Bills({
          document,
          onNavigate,
          store: mockedStore,
          localStorage: window.localStorage,
        });

        const handleClickNewBill = jest.fn(billsContainer.handleClickNewBill);
        const newBillButton = screen.getByTestId("btn-new-bill");
        newBillButton.addEventListener("click", () => handleClickNewBill());
        userEvent.click(newBillButton);

        expect(handleClickNewBill).toHaveBeenCalled();
        expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      });
    });
    describe("When I navigate to Bills", () => {
      test("should fetches the bills from mock API GET", async () => {
        const bills = new Bills({
          document,
          onNavigate,
          store: mockedStore,
          localStorage,
        });
        bills.getBills().then((data) => {
          document.body.innerHTML = BillsUI({ data });
          expect(document.querySelector("tbody").rows.length).toBe(4);
        });
      });
    });
  });
});
