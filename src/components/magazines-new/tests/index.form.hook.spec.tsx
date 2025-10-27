import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useModal } from '@/commons/providers/modal/modal.provider';
import { useMagazineForm } from '../hooks/index.form.hook';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/commons/providers/modal/modal.provider', () => ({
  useModal: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock FileReader
global.FileReader = jest.fn().mockImplementation(() => ({
  readAsDataURL: jest.fn(),
  onload: null,
  result: 'data:image/jpeg;base64,test-image-data',
}));

describe('useMagazineForm', () => {
  const mockPush = jest.fn();
  const mockOpenModal = jest.fn();
  const mockCloseModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useModal as jest.Mock).mockReturnValue({
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    });
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize form with default values', () => {
    const TestComponent = () => {
      const { form } = useMagazineForm();
      return <div data-testid="form">{JSON.stringify(form.getValues())}</div>;
    };

    render(<TestComponent />);
    
    const formData = JSON.parse(screen.getByTestId('form').textContent || '{}');
    expect(formData).toEqual({
      image: '',
      category: '',
      title: '',
      introduce: '',
      content: '',
      tag: '',
    });
  });

  it('should handle image upload', async () => {
    const TestComponent = () => {
      const { form, handleImageUpload } = useMagazineForm();
      return (
        <div>
          <input
            type="file"
            onChange={handleImageUpload}
            data-testid="file-input"
          />
          <div data-testid="image-value">{form.getValues('image')}</div>
        </div>
      );
    };

    render(<TestComponent />);
    
    const fileInput = screen.getByTestId('file-input');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByTestId('image-value').textContent).toBe('data:image/jpeg;base64,test-image-data');
    });
  });

  it('should validate form fields', () => {
    const TestComponent = () => {
      const { form, isFormValid } = useMagazineForm();
      return (
        <div>
          <div data-testid="is-valid">{isFormValid ? 'valid' : 'invalid'}</div>
          <button onClick={() => form.setValue('title', 'Test Title')}>
            Set Title
          </button>
        </div>
      );
    };

    render(<TestComponent />);
    
    expect(screen.getByTestId('is-valid').textContent).toBe('invalid');
    
    fireEvent.click(screen.getByText('Set Title'));
    
    expect(screen.getByTestId('is-valid').textContent).toBe('invalid'); // Still invalid because other fields are empty
  });

  it('should submit form and save to localStorage', async () => {
    const TestComponent = () => {
      const { form, onSubmit } = useMagazineForm();
      
      const handleSubmit = () => {
        form.setValue('image', 'test-image');
        form.setValue('category', 'frontend');
        form.setValue('title', 'Test Title');
        form.setValue('introduce', 'Test Introduce');
        form.setValue('content', 'Test Content');
        form.setValue('tag', 'Test Tag');
        onSubmit(form.getValues());
      };

      return (
        <button onClick={handleSubmit} data-testid="submit-btn">
          Submit
        </button>
      );
    };

    render(<TestComponent />);
    
    fireEvent.click(screen.getByTestId('submit-btn'));
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'magazines',
        expect.stringContaining('"id":1')
      );
      expect(mockOpenModal).toHaveBeenCalled();
    });
  });

  it('should handle existing magazines in localStorage', async () => {
    const existingMagazines = [
      { id: 1, image: 'test1', category: 'frontend', title: 'Test 1', introduce: 'Intro 1', content: 'Content 1', tag: 'Tag 1', createdAt: '2023-01-01' },
      { id: 2, image: 'test2', category: 'backend', title: 'Test 2', introduce: 'Intro 2', content: 'Content 2', tag: 'Tag 2', createdAt: '2023-01-02' }
    ];
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingMagazines));

    const TestComponent = () => {
      const { form, onSubmit } = useMagazineForm();
      
      const handleSubmit = () => {
        form.setValue('image', 'test-image');
        form.setValue('category', 'frontend');
        form.setValue('title', 'Test Title');
        form.setValue('introduce', 'Test Introduce');
        form.setValue('content', 'Test Content');
        form.setValue('tag', 'Test Tag');
        onSubmit(form.getValues());
      };

      return (
        <button onClick={handleSubmit} data-testid="submit-btn">
          Submit
        </button>
      );
    };

    render(<TestComponent />);
    
    fireEvent.click(screen.getByTestId('submit-btn'));
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'magazines',
        expect.stringContaining('"id":3') // Should be 3 (max existing id + 1)
      );
    });
  });

  it('should navigate to magazines list when goToList is called', () => {
    const TestComponent = () => {
      const { goToList } = useMagazineForm();
      return (
        <button onClick={goToList} data-testid="go-to-list">
          Go to List
        </button>
      );
    };

    render(<TestComponent />);
    
    fireEvent.click(screen.getByTestId('go-to-list'));
    
    expect(mockPush).toHaveBeenCalledWith('/magazines');
  });
});