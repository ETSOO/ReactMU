import React from 'react';
import { SelectEx } from '../src';
import { findByText, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Utils } from '@etsoo/shared';
import { act } from 'react-dom/test-utils';

it('Render SelectEx', async () => {
    // Arrange
    type T = { id: number; name: string };
    const options: T[] = [
        { id: 1, name: 'Name 1' },
        { id: 2, name: 'Name 2' }
    ];

    Utils.addBlankItem(options, 'id', 'name');

    const itemChangeCallback = jest.fn((option, userAction) => {
        if (userAction) expect(option).toBeUndefined();
        else expect(option.id).toBe(1);
    });

    // Render component
    const { baseElement } = render(
        <SelectEx<T>
            options={options}
            name="test"
            onItemChange={itemChangeCallback}
            value={1}
            search
            labelField="name"
        />
    );

    expect(itemChangeCallback).toBeCalled();

    // Act, click to show the list
    const button = screen.getByRole('button');
    fireEvent.mouseDown(button); // Not click

    // Get list item
    const itemName2 = await findByText(baseElement, 'Name 2');
    expect(itemName2.nodeName).toBe('SPAN');

    const itemBlank = await findByText(baseElement, '---');
    expect(itemBlank.nodeName).toBe('SPAN');

    act(() => {
        itemBlank.click();
    });

    expect(itemChangeCallback).toBeCalledTimes(2);
});
