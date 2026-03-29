import orderReducer, { setSelectedProduct, clearSelectedProduct } from '../orderSlice';

describe('orderSlice', () => {
  const initialState = {
    selectedProduct: null,
  };

  const mockProduct = {
    id: '1',
    image: { uri: 'https://example.com/image.png' },
    title: 'Test Product',
    description: 'Test Description',
    price: '$99.99',
    brand: 'Test Brand',
  };

  it('should return the initial state', () => {
    expect(orderReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setSelectedProduct', () => {
    it('should set the selected product', () => {
      const action = setSelectedProduct(mockProduct);
      const state = orderReducer(initialState, action);

      expect(state.selectedProduct).toEqual(mockProduct);
    });

    it('should replace existing selected product', () => {
      const stateWithProduct = {
        selectedProduct: mockProduct,
      };

      const newProduct = {
        ...mockProduct,
        id: '2',
        title: 'New Product',
      };

      const action = setSelectedProduct(newProduct);
      const state = orderReducer(stateWithProduct, action);

      expect(state.selectedProduct).toEqual(newProduct);
      expect(state.selectedProduct.id).toBe('2');
    });

    it('should handle product without brand', () => {
      const productWithoutBrand = {
        id: '3',
        image: { uri: 'https://example.com/image2.png' },
        title: 'Product Without Brand',
        description: 'Description',
        price: '$50.00',
      };

      const action = setSelectedProduct(productWithoutBrand);
      const state = orderReducer(initialState, action);

      expect(state.selectedProduct).toEqual(productWithoutBrand);
      expect(state.selectedProduct.brand).toBeUndefined();
    });
  });

  describe('clearSelectedProduct', () => {
    it('should clear the selected product', () => {
      const stateWithProduct = {
        selectedProduct: mockProduct,
      };

      const action = clearSelectedProduct();
      const state = orderReducer(stateWithProduct, action);

      expect(state.selectedProduct).toBeNull();
    });

    it('should handle clearing when no product is selected', () => {
      const action = clearSelectedProduct();
      const state = orderReducer(initialState, action);

      expect(state.selectedProduct).toBeNull();
    });
  });
});

