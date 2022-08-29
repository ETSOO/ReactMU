import { MUGlobal } from '../src/';

// Theme update function
const updateFunc = (value: number) => `${value * 8}px`;

// Arrange
const paddings = { sx: 2, sm: 3, key: 'a' };

test('getMenuItem tests', () => {
    // Assert
    expect(
        MUGlobal.getMenuItem('/user/add', '/user/all').selected
    ).toBeTruthy();
    expect(MUGlobal.getMenuItem('/user/add', '/user/*').selected).toBeTruthy();
    expect(
        MUGlobal.getMenuItem('/user/add', '/user/edit').selected
    ).toBeFalsy();
});

test('half tests', () => {
    // Act
    const result = MUGlobal.half(paddings);

    // Assert
    expect(paddings).toHaveProperty('sx', 2);
    expect(result).toHaveProperty('sx', 1);
    expect(result).toHaveProperty('sm', 1.5);
});

test('increase tests', () => {
    // Act
    const result = MUGlobal.increase(paddings, 2);

    // Assert
    expect(paddings).toHaveProperty('sx', 2);
    expect(result).toHaveProperty('sx', 4);
    expect(result).toHaveProperty('sm', 5);
});

test('adjustWithTheme tests', () => {
    // Act
    const result = MUGlobal.adjustWithTheme(160, paddings, updateFunc);

    // Assert
    expect(paddings).toHaveProperty('sx', 2);
    expect(result).toHaveProperty('sx', '144px');
    expect(result).toHaveProperty('sm', '136px');
});

test('updateWithTheme tests', () => {
    // Act
    const result = MUGlobal.updateWithTheme(paddings, updateFunc);

    // Assert
    expect(paddings).toHaveProperty('sx', 2);
    expect(result).toHaveProperty('sx', '16px');
    expect(result).toHaveProperty('sm', '24px');
});
