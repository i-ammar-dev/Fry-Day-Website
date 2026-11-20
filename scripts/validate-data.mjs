import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const [menu, site, deals] = await Promise.all([
  readFile(new URL("../data/menu.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../data/site.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../data/deals.json", import.meta.url), "utf8").then(JSON.parse),
]);

assert.ok(Array.isArray(menu.categories) && menu.categories.length > 0, "Menu must contain categories");
assert.ok(site.name && site.location && site.phoneDisplay && site.whatsappNumber, "Business contact details are required");
assert.ok(Array.isArray(site.openingHours) && site.openingHours.length === 7, "Opening hours must contain all seven days");
assert.ok(Array.isArray(deals) && deals.length > 0, "At least one deal card is required");

const itemIds = new Set();
let itemCount = 0;
for (const category of menu.categories) {
  assert.ok(category.id && category.name && Array.isArray(category.items), "Each category needs an id, name and item list");
  for (const item of category.items) {
    itemCount += 1;
    assert.ok(item.id && item.name && Number.isFinite(item.price) && item.price > 0, `Invalid menu item in ${category.name}`);
    assert.ok(!itemIds.has(item.id), `Duplicate menu item id: ${item.id}`);
    itemIds.add(item.id);
    if (item.variants) {
      assert.ok(item.variants.length > 0, `${item.name} must have at least one variant`);
      for (const variant of item.variants) {
        assert.ok(variant.id && variant.label && Number.isFinite(variant.price) && variant.price > 0, `Invalid variant on ${item.name}`);
      }
    }
  }
}

console.log(`Data check passed: ${menu.categories.length} categories, ${itemCount} menu items, ${deals.length} deals.`);
