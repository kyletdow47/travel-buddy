import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ReceiptRow from '../../src/components/ReceiptRow';

jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));
jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

// Render Swipeable transparently so both content and right-actions are visible
jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return {
    Swipeable: ({ children, renderRightActions }: any) => {
      const rightActions = renderRightActions ? renderRightActions() : null;
      return (
        <View>
          {children}
          {rightActions}
        </View>
      );
    },
    GestureHandlerRootView: ({ children }: any) => children,
  };
});

const BASE_RECEIPT = {
  id: 'r1',
  trip_id: 't1',
  stop_id: null,
  merchant: 'Café de Flore',
  amount: 42.5,
  category: 'food',
  receipt_date: '2026-06-03',
  image_url: null,
  notes: null,
  lat: null,
  lng: null,
  created_at: '2026-01-01T00:00:00Z',
};

describe('ReceiptRow', () => {
  afterEach(() => jest.clearAllMocks());

  it('renders the merchant name', () => {
    const { getByText } = render(
      <ReceiptRow receipt={BASE_RECEIPT} onPress={jest.fn()} onDelete={jest.fn()} />
    );
    expect(getByText('Café de Flore')).toBeTruthy();
  });

  it('renders "Unknown merchant" when merchant is null', () => {
    const { getByText } = render(
      <ReceiptRow
        receipt={{ ...BASE_RECEIPT, merchant: null }}
        onPress={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(getByText('Unknown merchant')).toBeTruthy();
  });

  it('renders amount with $ and 2 decimal places', () => {
    const { getByText } = render(
      <ReceiptRow receipt={BASE_RECEIPT} onPress={jest.fn()} onDelete={jest.fn()} />
    );
    expect(getByText('$42.50')).toBeTruthy();
  });

  it('renders the capitalised category', () => {
    const { getByText } = render(
      <ReceiptRow receipt={BASE_RECEIPT} onPress={jest.fn()} onDelete={jest.fn()} />
    );
    expect(getByText(/Food/)).toBeTruthy();
  });

  it('calls onPress when the row is tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ReceiptRow receipt={BASE_RECEIPT} onPress={onPress} onDelete={jest.fn()} />
    );
    fireEvent.press(getByText('Café de Flore'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete action button is pressed', () => {
    const onDelete = jest.fn();
    const { getByText } = render(
      <ReceiptRow receipt={BASE_RECEIPT} onPress={jest.fn()} onDelete={onDelete} />
    );
    fireEvent.press(getByText('Delete'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
