import { createPinia, setActivePinia } from "pinia";
import { useMapStore } from "./map";

let map: ReturnType<typeof useMapStore>;

const setup = () => {
  const pinia = createPinia();
  setActivePinia(pinia);
  map = useMapStore();
};

describe("getters", () => {
  beforeEach(() => {
    setup();
  });

  afterEach(() => {
    productStore.$reset();
    map.$reset();
  });

  it("sums total of cart", () => {
    map.add(testProduct);
    map.add(testProduct);
    expect(map.total).toBe(200);
    map.remove(testProduct);
    expect(map.total).toBe(100);
  });

  it("formattedCart", () => {
    map.add(testProduct);

    expect(map.formattedCart).toEqual([
      {
        cost: 100,
        name: "Product",
        quantity: 1,
      },
    ]);
  });
});
