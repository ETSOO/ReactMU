import React from 'react';
import { SelectEx } from '../src';
import { findByText, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

it('Render SelectEx', async () => {
    // Arrange
    type T = { id: number; name: string };
    const options: T[] = [
        { id: 1, name: 'Name 1' },
        { id: 2, name: 'Name 2' }
    ];

    // Render component
    const { baseElement } = render(
        <SelectEx<T> options={options} name="test" search labelField="name" />
    );

    // Act, click to show the list
    const button = screen.getByRole('button');
    fireEvent.mouseDown(button); // Not click

    // Get list item
    const item = await findByText(baseElement, 'Name 2');
    expect(item.nodeName).toBe('SPAN');
});
