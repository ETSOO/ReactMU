import React from 'react';
import { SelectEx } from '../src';
import { findByText, fireEvent, render, screen } from '@testing-library/react';
import { ListType1, Utils } from '@etsoo/shared';
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

it('Render multiple SelectEx', async () => {
    // Arrange
    type T = ListType1;
    const options: T[] = [
        { id: '1', label: 'Name 1' },
        { id: '2', label: 'Name 2' },
        { id: '3', label: 'Name 3' }
    ];

    const itemChangeCallback = jest.fn((option, userAction) => {
        if (userAction) expect(option.id).toBe('3');
        else expect(option.id).toBe('1');
    });

    // Render component
    const { baseElement } = render(
        <SelectEx<T>
            options={options}
            name="test"
            onItemChange={itemChangeCallback}
            value={['1', '2']}
            multiple
        />
    );

    expect(itemChangeCallback).toBeCalled();

    // Act, click to show the list
    const button = screen.getByRole('button');
    fireEvent.mouseDown(button); // Not click

    // Get list item
    const itemName1 = await findByText(baseElement, 'Name 1');
    const checkbox1 = itemName1.closest('li')?.querySelector('input');

    expect(checkbox1?.checked).toBeTruthy();

    const itemName3 = await findByText(baseElement, 'Name 3');
    expect(itemName3.nodeName).toBe('SPAN');

    // Checkbox
    const checkbox3 = itemName3.closest('li')?.querySelector('input');

    act(() => {
        checkbox3?.click();
    });

    expect(checkbox3?.checked).toBeTruthy();

    expect(itemChangeCallback).toBeCalledTimes(2);
});
