export function convertToNumber(text) {
  if (!text) return undefined;

  text = text.replaceAll(".", "");
  text = text.replace(",", ".");

  const newNumber = Number.parseFloat(text);

  return Number.isNaN(newNumber) ? undefined : newNumber;
}
