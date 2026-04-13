import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StopRow from '../../src/components/StopRow';

jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));
jest.mock('../../src/components/CategoryIcon', () => ({
  CategoryIcon: 'CategoryIcon',
}));

const BASE_STOP = {
  id: 's1',
  trip_id: 't1',
  name: 'Eiffel Tower',
  category: 'activity',
  status: 'upcoming',
  sort_order: 0,
  location: 'Paris, France',
  planned_date: '2026-06-03',
  notes: null,
  lat: 48.8584,
  lng: 2.2945,
  created_at: '2026-01-01T00:00:00Z',
};

describe('StopRow', () => {
  afterEach(() => jest.clearAllMocks());

  it('renders the stop name', () => {
    const { getByText } = render(<StopRow stop={BASE_STOP} />);
    expect(getByText('Eiffel Tower')).toBeTruthy();
  });

  it('shows "Upcoming" status chip for upcoming stop', () => {
    const { getByText } = render(<StopRow stop={BASE_STOP} />);
    expect(getByText('Upcoming')).toBeTruthy();
  });

  it('shows "Current" status chip for current stop', () => {
    const { getByText } = render(
      <StopRow stop={{ ...BASE_STOP, status: 'current' }} />
    );
    expect(getByText('Current')).toBeTruthy();
  });

  it('shows "Done" status chip for done stop', () => {
    const { getByText } = render(
      <StopRow stop={{ ...BASE_STOP, status: 'done' }} />
    );
    expect(getByText('Done')).toBeTruthy();
  });

  it('renders location when provided', () => {
    const { getByText } = render(<StopRow stop={BASE_STOP} />);
    expect(getByText('Paris, France')).toBeTruthy();
  });

  it('cycles status upcoming → current when chip is pressed', () => {
    const onStatusChange = jest.fn();
    const { getByText } = render(
      <StopRow stop={BASE_STOP} onStatusChange={onStatusChange} />
    );

    fireEvent.press(getByText('Upcoming'));
    expect(onStatusChange).toHaveBeenCalledWith(BASE_STOP, 'current');
  });

  it('cycles status current → done when chip is pressed', () => {
    const onStatusChange = jest.fn();
    const { getByText } = render(
      <StopRow stop={{ ...BASE_STOP, status: 'current' }} onStatusChange={onStatusChange} />
    );

    fireEvent.press(getByText('Current'));
    expect(onStatusChange).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'current' }),
      'done'
    );
  });

  it('cycles status done → upcoming when chip is pressed', () => {
    const onStatusChange = jest.fn();
    const { getByText } = render(
      <StopRow stop={{ ...BASE_STOP, status: 'done' }} onStatusChange={onStatusChange} />
    );

    fireEvent.press(getByText('Done'));
    expect(onStatusChange).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'done' }),
      'upcoming'
    );
  });

  it('does not throw when onStatusChange is not provided', () => {
    const { getByText } = render(<StopRow stop={BASE_STOP} />);
    expect(() => fireEvent.press(getByText('Upcoming'))).not.toThrow();
  });
});
