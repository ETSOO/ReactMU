import { AuditLineChangesDto, IApp } from '@etsoo/appscript';
import { NotificationMessageType } from '@etsoo/notificationbase';
import { Utils } from '@etsoo/shared';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from '@mui/material';
import React from 'react';
import { globalApp } from './app/ReactApp';

/**
 * Check obj is instance of AuditLineChangesDto
 * @param obj Input
 * @returns Result
 */
export function IsAuditLineUpdateData(obj: any): obj is AuditLineChangesDto {
    return (
        typeof obj === 'object' &&
        'oldData' in obj &&
        typeof obj.oldData === 'object' &&
        'newData' in obj &&
        typeof obj.newData === 'object'
    );
}

// Format value
const formatValue = (value: unknown, app: IApp) => {
    if (value == null) return '';
    if (value instanceof Date) return app.formatDate(value, 'ds');
    return `${value}`;
};

/**
 * Show data comparison
 * @param data Data
 * @param modelTitle Model window title
 * @param getLabel Get label callback
 */
export const ShowDataComparison = (
    data: AuditLineChangesDto,
    modelTitle?: string,
    getLabel?: (field: string) => string
) => {
    modelTitle ??= globalApp.get<string>('dataComparison');
    getLabel ??= (key) => {
        return globalApp.get(Utils.formatInitial(key)) ?? key;
    };

    const keys = new Set([
        ...Object.keys(data.oldData),
        ...Object.keys(data.newData)
    ]);

    const rows = Array.from(keys).map((field) => ({
        field,
        oldValue: data.oldData[field],
        newValue: data.newData[field]
    }));

    const inputs = (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell width="18%">{getLabel('field')}</TableCell>
                    <TableCell width="41%" align="right">
                        {getLabel('oldValue')}
                    </TableCell>
                    <TableCell width="41%" align="right">
                        {getLabel('newValue')}
                    </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {rows.map((row) => (
                    <TableRow key={row.field}>
                        <TableCell>{getLabel!(row.field)}</TableCell>
                        <TableCell align="right">
                            {formatValue(row.oldValue, globalApp)}
                        </TableCell>
                        <TableCell align="right">
                            {formatValue(row.newValue, globalApp)}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    globalApp.notifier.alert(
        [undefined, modelTitle],
        undefined,
        NotificationMessageType.Info,
        { fullScreen: globalApp.smDown, inputs }
    );
};
