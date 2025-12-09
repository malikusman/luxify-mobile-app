import closetReducer, { addImage, addMultipleImages, removeImage, clearCloset, ClosetImage } from '../closetSlice';

describe('closetSlice', () => {
  const initialState = {
    images: [],
    maxImages: 5,
  };

  it('should return the initial state', () => {
    expect(closetReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('addImage', () => {
    it('should add an image when under max limit', () => {
      const uri = 'file://test-image.jpg';
      const action = addImage(uri);
      const state = closetReducer(initialState, action);

      expect(state.images).toHaveLength(1);
      expect(state.images[0].uri).toBe(uri);
      expect(state.images[0].id).toBeDefined();
      expect(state.images[0].timestamp).toBeDefined();
    });

    it('should not add image when at max limit', () => {
      const fullState = {
        images: Array(5).fill(null).map((_, i) => ({
          id: `img_${i}`,
          uri: `file://test-${i}.jpg`,
          timestamp: Date.now(),
        })),
        maxImages: 5,
      };

      const action = addImage('file://new-image.jpg');
      const state = closetReducer(fullState, action);

      expect(state.images).toHaveLength(5);
    });

    it('should generate unique IDs for each image', () => {
      const uri1 = 'file://test1.jpg';
      const uri2 = 'file://test2.jpg';

      const state1 = closetReducer(initialState, addImage(uri1));
      const state2 = closetReducer(state1, addImage(uri2));

      expect(state2.images[0].id).not.toBe(state2.images[1].id);
    });
  });

  describe('addMultipleImages', () => {
    it('should add multiple images when under limit', () => {
      const uris = ['file://test1.jpg', 'file://test2.jpg', 'file://test3.jpg'];
      const action = addMultipleImages(uris);
      const state = closetReducer(initialState, action);

      expect(state.images).toHaveLength(3);
      expect(state.images.map(img => img.uri)).toEqual(uris);
    });

    it('should only add images up to max limit', () => {
      const uris = ['file://test1.jpg', 'file://test2.jpg', 'file://test3.jpg', 'file://test4.jpg', 'file://test5.jpg', 'file://test6.jpg'];
      const action = addMultipleImages(uris);
      const state = closetReducer(initialState, action);

      expect(state.images).toHaveLength(5);
    });

    it('should respect remaining slots', () => {
      const partialState = {
        images: [
          { id: 'img_1', uri: 'file://existing1.jpg', timestamp: Date.now() },
          { id: 'img_2', uri: 'file://existing2.jpg', timestamp: Date.now() },
        ],
        maxImages: 5,
      };

      const uris = ['file://test1.jpg', 'file://test2.jpg', 'file://test3.jpg', 'file://test4.jpg'];
      const action = addMultipleImages(uris);
      const state = closetReducer(partialState, action);

      expect(state.images).toHaveLength(5);
    });
  });

  describe('removeImage', () => {
    it('should remove an image by id', () => {
      const stateWithImages = {
        images: [
          { id: 'img_1', uri: 'file://test1.jpg', timestamp: Date.now() },
          { id: 'img_2', uri: 'file://test2.jpg', timestamp: Date.now() },
          { id: 'img_3', uri: 'file://test3.jpg', timestamp: Date.now() },
        ],
        maxImages: 5,
      };

      const action = removeImage('img_2');
      const state = closetReducer(stateWithImages, action);

      expect(state.images).toHaveLength(2);
      expect(state.images.find(img => img.id === 'img_2')).toBeUndefined();
    });

    it('should not remove anything if id does not exist', () => {
      const stateWithImages = {
        images: [
          { id: 'img_1', uri: 'file://test1.jpg', timestamp: Date.now() },
        ],
        maxImages: 5,
      };

      const action = removeImage('non_existent_id');
      const state = closetReducer(stateWithImages, action);

      expect(state.images).toHaveLength(1);
    });
  });

  describe('clearCloset', () => {
    it('should remove all images', () => {
      const stateWithImages = {
        images: [
          { id: 'img_1', uri: 'file://test1.jpg', timestamp: Date.now() },
          { id: 'img_2', uri: 'file://test2.jpg', timestamp: Date.now() },
        ],
        maxImages: 5,
      };

      const action = clearCloset();
      const state = closetReducer(stateWithImages, action);

      expect(state.images).toHaveLength(0);
    });
  });
});

