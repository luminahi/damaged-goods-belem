import { DamagedBelem } from "./DamagedBelem.js";
import { Modal } from "./Modal.js";

window.onload = () => main();

function printSection(section) {
  const elements = Array.from(document.getElementsByClassName("to-hide"));

  const sectionToPrint = document.getElementById(section);
  const sectionDisplay = sectionToPrint.style.display;

  const infoContainer = document.getElementById("info-container");
  const infoDiv = document.getElementById("info");
  const infoSpot = sectionToPrint.querySelector(".info-spot");

  const savedDisplays = elements.map((element) => {
    const currentDisplay = window.getComputedStyle(element).display;
    element.style.display = "none";
    return currentDisplay;
  });

  infoSpot.appendChild(infoDiv);
  sectionToPrint.style.display = "block";

  window.print();

  Array.from(elements).forEach((element, index) => {
    element.style.display = savedDisplays[index];
  });

  sectionToPrint.style.display = sectionDisplay;
  infoContainer.appendChild(infoDiv);
}

function showTables() {
  const allTables = document.getElementsByClassName("item-table");
  Array.from(allTables, (table) => {
    table.style.display = "block";
  });
}

function setDate() {
  const dateInfo = document.getElementById("date-info");
  dateInfo.value = new Date().toISOString().split("T")[0];
}

function validatePrint(event, section, input, modal) {
  event.stopPropagation();
  if (input.value) return printSection(section);
  modal.open();
}

function main() {
  const damagedInput = document.getElementById("damaged-input");
  const storageInput = document.getElementById("storage-input");

  const damagedTableLT10 = document.querySelector("#item-table-lt-10 tbody");
  const damagedTableGT10 = document.querySelector("#item-table-gt-10 tbody");
  const removedTable = document.querySelector("#removed-table tbody");

  const btnLT10 = document.getElementById("btn-lt-10");
  const btnGT10 = document.getElementById("btn-gt-10");
  const btnToRemove = document.getElementById("btn-to-remove");

  const palletInput = document.getElementById("btn-pallet");
  const palletElements = document.getElementsByClassName("pallet");

  const dialog = document.querySelector("#modal-container dialog");
  const modal = new Modal(dialog);

  btnLT10.addEventListener("click", (e) =>
    validatePrint(e, "lt-10", palletInput, modal)
  );

  btnGT10.addEventListener("click", (e) =>
    validatePrint(e, "gt-10", palletInput, modal)
  );

  btnToRemove.addEventListener("click", (e) =>
    validatePrint(e, "to-remove", palletInput, modal)
  );

  setDate();

  const belem = new DamagedBelem(
    damagedTableLT10,
    damagedTableGT10,
    removedTable
  );

  palletInput.addEventListener("change", (e) => {
    Array.from(palletElements, (element) => {
      element.textContent = e.target.value;
    });
  });

  storageInput.addEventListener("change", (e) => {
    belem.clearStorage();
    Array.from(e.target.files, (file) => {
      belem.readStorage(file);
      console.info(`estoque: ${file.name} foi lido.`);
    });
  });

  damagedInput.addEventListener("change", (e) => {
    belem.readDamaged(e.target.files);
    showTables();
    Array.from(e.target.files, (file) => {
      console.info(`avaria: ${file.name} foi lido.`);
    });
  });
}
