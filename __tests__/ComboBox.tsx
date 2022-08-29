import React from 'react';
import { ComboBox } from '../src';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

it('Render ComboBox', async () => {
    // Arrange
    type T = { id: number; name: string };
    const options: T[] = [
        { id: 1, name: 'Name 1' },
        { id: 2, name: 'Name 2' }
    ];

    render(
        <ComboBox<T>
            name="Test"
            options={options}
            labelField="name"
            label="Test"
        />
    );

    // Act, click the list
    const clicked = fireEvent.click(screen.getByRole('button'));
    expect(clicked).toBeTruthy();

    // Get list item
    const item = screen.getByText('Name 1');
    expect(item.nodeName).toBe('LI');
});
