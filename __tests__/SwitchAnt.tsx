import { getByText, render } from '@testing-library/react';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { SwitchAnt } from '../src/SwitchAnt';

it('SwitchAnt Tests', () => {
    const onChange = jest.fn((event: React.ChangeEvent<HTMLInputElement>) =>
        expect(event.target.checked).toBeTruthy()
    );

    // Render component
    const { baseElement } = render(
        <SwitchAnt startLabel="No" endLabel="Yes" onChange={onChange} />
    );

    const yes = getByText(baseElement, 'Yes');

    act(() => {
        yes.click();
    });

    expect(onChange).toBeCalled();
});
