import { DataTypes, Utils } from '@etsoo/shared';

/**
 * Labels
 */
export namespace Labels {
    /**
     * Common page labels
     */
    export const CommonPage = {
        add: 'Add',
        back: 'Back',
        delete: 'Delete',
        more: 'More',
        pullToRefresh: 'Pull down to refresh',
        refresh: 'Refresh',
        refreshing: 'Refreshing',
        releaseToRefresh: 'Release to refresh',
        reset: 'Reset',
        save: 'Save',
        scrollTop: 'Scroll to top',
        submit: 'Submit'
    };

    /**
     * Notification MU labels
     */
    export const NotificationMU = {
        alertTitle: 'Warning',
        alertOK: 'OK',
        confirmTitle: 'Confirm',
        confirmYes: 'OK',
        confirmNo: 'Cancel',
        promptTitle: 'Input',
        promptCancel: 'Cancel',
        promptOK: 'OK',
        loading: 'Loading',
        success: 'Success',
        warning: 'Warning',
        info: 'Information'
    };

    /**
     * UserAvatarEditor labels
     */
    export const UserAvatarEditor = {
        done: 'Done',
        reset: 'Reset',
        rotateLeft: 'Rotate left 90°',
        rotateRight: 'Rotate right 90°',
        upload: 'Upload',
        zoom: 'Zoom'
    };

    /**
     * setLabelReference key reference
     */
    export interface setLabelsReference {
        commonPage?: DataTypes.StringDictionary;
        notificationMU?: DataTypes.StringDictionary;
        userAvatarEditor?: DataTypes.StringDictionary;
    }

    /**
     * Set components' labels
     * @param labels Labels
     * @param reference Key reference
     */
    export const setLabels = (
        labels: DataTypes.StringRecord,
        reference: setLabelsReference = {}
    ) => {
        Utils.setLabels(CommonPage, labels, reference.commonPage);
        Utils.setLabels(NotificationMU, labels, reference.notificationMU);
        Utils.setLabels(UserAvatarEditor, labels, reference.userAvatarEditor);
    };
}
