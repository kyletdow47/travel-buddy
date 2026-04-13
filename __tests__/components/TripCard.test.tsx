import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { TripCard } from '../../src/components/TripCard';

jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

const BASE_TRIP = {
  id: '1',
  name: 'Tokyo Adventure',
  status: 'active',
  budget: 3000,
  spent: 1200,
  start_date: '2026-07-01',
  end_date: '2026-07-14',
  created_at: '2026-01-01T00:00:00Z',
};

const noop = jest.fn();

describe('TripCard', () => {
  afterEach(() => jest.clearAllMocks());

  it('renders the trip name', () => {
    const { getByText } = render(
      <TripCard trip={BASE_TRIP} onEdit={noop} onDelete={noop} />
    );
    expect(getByText('Tokyo Adventure')).toBeTruthy();
  });

  it('shows the correct status label for active trip', () => {
    const { getByText } = render(
      <TripCard trip={BASE_TRIP} onEdit={noop} onDelete={noop} />
    );
    expect(getByText('Active')).toBeTruthy();
  });

  it('shows "Planning" status label for planning trip', () => {
    const { getByText } = render(
      <TripCard trip={{ ...BASE_TRIP, status: 'planning' }} onEdit={noop} onDelete={noop} />
    );
    expect(getByText('Planning')).toBeTruthy();
  });

  it('shows "Completed" status label for completed trip', () => {
    const { getByText } = render(
      <TripCard trip={{ ...BASE_TRIP, status: 'completed' }} onEdit={noop} onDelete={noop} />
    );
    expect(getByText('Completed')).toBeTruthy();
  });

  it('renders budget progress section when budget > 0', () => {
    const { getByText } = render(
      <TripCard trip={BASE_TRIP} onEdit={noop} onDelete={noop} />
    );
    expect(getByText('Budget')).toBeTruthy();
    expect(getByText('$1,200 / $3,000')).toBeTruthy();
  });

  it('does not render budget section when budget is null', () => {
    const { queryByText } = render(
      <TripCard trip={{ ...BASE_TRIP, budget: null }} onEdit={noop} onDelete={noop} />
    );
    expect(queryByText('Budget')).toBeNull();
  });

  it('renders date range when start and end date are set', () => {
    const { getByText } = render(
      <TripCard trip={BASE_TRIP} onEdit={noop} onDelete={noop} />
    );
    // Date range should be present (formatted)
    expect(getByText(/Jul/)).toBeTruthy();
  });

  it('shows Alert on long press', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByRole } = render(
      <TripCard trip={BASE_TRIP} onEdit={noop} onDelete={noop} />
    );

    fireEvent(getByRole('button'), 'longPress');
    expect(alertSpy).toHaveBeenCalledWith(
      'Tokyo Adventure',
      'What would you like to do?',
      expect.any(Array)
    );
  });

  it('calls onEdit when Edit action is selected', () => {
    const onEdit = jest.fn();
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(
      (_title, _msg, buttons) => {
        const editBtn = buttons?.find((b) => b.text === 'Edit');
        editBtn?.onPress?.();
      }
    );

    const { getByRole } = render(
      <TripCard trip={BASE_TRIP} onEdit={onEdit} onDelete={noop} />
    );
    fireEvent(getByRole('button'), 'longPress');

    expect(onEdit).toHaveBeenCalledWith(BASE_TRIP);
    alertSpy.mockRestore();
  });
});
