import { convertToNumber } from "./util.js";

export class DamagedBelem {
  damagedMap;
  storageMap;

  damagedTableLT10;
  damagedTableGT10;
  removedTable;

  constructor(lt10table, gt10table, removedTable) {
    this.damagedTableLT10 = lt10table;
    this.damagedTableGT10 = gt10table;
    this.removedTable = removedTable;

    this.damagedMap = new Map();
    this.storageMap = new Map();
  }

  readStorage(file) {
    if (!file) return;

    const reader = new FileReader();

    reader.addEventListener("load", (e) => {
      const data = e.target.result;

      const lines = data.split("\n");

      lines.forEach((line) => {
        let [seq, idAndDescription] = line.trim().split(/\s{2,}/);

        if (!isNaN(Number(seq)) && idAndDescription) {
          const [id, ...description] = idAndDescription.split(" ");

          if (!isNaN(Number(id.replace("-", ""))))
            this.storageMap.set(id, { description: description.join(" ") });
        }
      });
    });

    reader.readAsText(file);
  }

  readDamaged(files) {
    this.clearDamaged();
    this.clearTables();
    let filesRead = 0;

    if (files.length <= 0) return;

    Array.from(files, (file) => {
      const reader = new FileReader();

      reader.addEventListener("load", (e) => {
        const data = e.target.result;

        const lines = data.split("\n");

        lines.forEach((line) => {
          let [id, description, qty, value] = line.trim().split(/\s{2,}/);

          qty = convertToNumber(qty);
          value = convertToNumber(value);

          if (id && description && qty && value) {
            if (this.damagedMap.has(id)) {
              qty = this.damagedMap.get(id).qty + qty;
            }

            this.damagedMap.set(id, { description, qty, value });
          }
        });

        filesRead++;

        if (filesRead === files.length) {
          this.fillTables();
        }
      });

      reader.readAsText(file);
    });
  }

  createElement(item) {
    const row = document.createElement("tr");

    const seqCell = document.createElement("td");
    seqCell.textContent = item.sequence;
    row.appendChild(seqCell);

    const idCell = document.createElement("td");
    idCell.textContent = item.id;
    row.appendChild(idCell);

    const descriptionCell = document.createElement("td");
    descriptionCell.textContent = item.description;
    row.appendChild(descriptionCell);

    const qtyCell = document.createElement("td");
    qtyCell.textContent = item.qty;
    row.appendChild(qtyCell);

    const valueCell = document.createElement("td");
    valueCell.textContent = item.value;
    row.appendChild(valueCell);

    const totalCell = document.createElement("td");
    totalCell.textContent = item.total;
    row.appendChild(totalCell);

    return row;
  }

  addDamagedItemRow(item, damagedTable) {
    const row = this.createElement(item);
    damagedTable.appendChild(row);
  }

  addRemovedItemRow(item) {
    const row = this.createElement(item);
    this.removedTable.appendChild(row);
  }

  fillTables() {
    const itemList = [...this.damagedMap];

    itemList.sort((a, b) => a[1].description.localeCompare(b[1].description));

    const lt10TotalSpan = document.getElementById("lt-10-total");
    const gt10TotalSpan = document.getElementById("gt-10-total");
    const toRemoveTotalSpan = document.getElementById("to-remove-total");

    const lt10UniqueSpan = document.getElementById("lt-10-unique");
    const gt10UniqueSpan = document.getElementById("gt-10-unique");
    const toRemoveUniqueSpan = document.getElementById("to-remove-unique");

    const lt10QtySpan = document.getElementById("lt-10-qty");
    const gt10QtySpan = document.getElementById("gt-10-qty");
    const toRemoveQtySpan = document.getElementById("to-remove-qty");

    let lt10Sequence = 0;
    let gt10Sequence = 0;
    let toRemoveSequence = 0;

    let lt10Total = 0;
    let gt10Total = 0;
    let toRemoveTotal = 0;

    let lt10Qty = 0;
    let gt10Qty = 0;
    let toRemoveQty = 0;

    itemList.forEach((item) => {
      const rawValue = item[1].value;
      const rawQty = item[1].qty;
      const rawTotal = rawValue * rawQty;

      const value = this.#moneyToString(rawValue);
      const total = this.#moneyToString(rawTotal);

      const damagedItem = {
        sequence: 0,
        id: item[0],
        description: item[1].description,
        qty: item[1].qty,
        value,
        total,
      };

      if (this.storageMap.has(damagedItem.id)) {
        damagedItem.sequence = ++toRemoveSequence;
        this.addRemovedItemRow(damagedItem);
        toRemoveTotal += rawTotal;
        toRemoveQty += damagedItem.qty;
      } else {
        if (damagedItem.qty > 10) {
          damagedItem.sequence = ++gt10Sequence;
          this.addDamagedItemRow(damagedItem, this.damagedTableGT10);
          gt10Total += rawTotal;
          gt10Qty += damagedItem.qty;
        } else {
          damagedItem.sequence = ++lt10Sequence;
          this.addDamagedItemRow(damagedItem, this.damagedTableLT10);
          lt10Total += rawTotal;
          lt10Qty += damagedItem.qty;
        }
      }
    });

    lt10TotalSpan.textContent = this.#moneyToString(lt10Total);
    lt10UniqueSpan.textContent = lt10Sequence;
    lt10QtySpan.textContent = lt10Qty;

    gt10TotalSpan.textContent = this.#moneyToString(gt10Total);
    gt10UniqueSpan.textContent = gt10Sequence;
    gt10QtySpan.textContent = gt10Qty;

    toRemoveTotalSpan.textContent = this.#moneyToString(toRemoveTotal);
    toRemoveUniqueSpan.textContent = toRemoveSequence;
    toRemoveQtySpan.textContent = toRemoveQty;
  }

  #moneyToString(value) {
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  }

  clearStorage() {
    this.storageMap.clear();
  }

  clearDamaged() {
    this.damagedMap.clear();
  }

  clearTables() {
    this.damagedTableLT10.innerHTML = "";
    this.damagedTableGT10.innerHTML = "";
    this.removedTable.innerHTML = "";
  }
}
