import React from 'react';

import CampaignSelect from '../../misc/CampaignSelect';
import DateInput from '../../forms/inputs/DateInput';
import RootPaneBase from '../RootPaneBase';
import { selectCampaign } from '../../../actions/campaign';
import {
    createAction,
    retrieveActions,
    updateAction
} from '../../../actions/action';


export default class CampaignSectionPaneBase extends RootPaneBase {
    getPaneFilters(data, filters) {
        filters = filters || {};

        return [
            <div key="dateFilter" className="AllActionsPane-dateFilter">
                <DateInput name="afterDate"
                    value={ filters.afterDate }
                    labelMsg="panes.allActions.filters.afterDate"
                    onValueChange={ this.onFilterChange.bind(this) }
                    />
                <DateInput name="beforeDate"
                    value={ filters.beforeDate }
                    labelMsg="panes.allActions.filters.beforeDate"
                    onValueChange={ this.onFilterChange.bind(this) }
                    />
            </div>,
            <CampaignSelect key="campaignSelect"
                value={ filters.campaign }
                onSelect={ this.onFilterChange.bind(this, 'campaign') }
                onCreate={ this.onCreateCampaign.bind(this) }
                onEdit={ this.onEditCampaign.bind(this) }/>
        ];
    }

    onFiltersApply(filters) {
        this.props.dispatch(selectCampaign(filters.campaign));
        this.props.dispatch(retrieveActions(filters.afterDate, filters.beforeDate));
    }

    onCalendarAddAction(date) {
        const selectedId = this.props.campaigns.selectedCampaign;
        const campParam = selectedId || 0;
        const dateParam = date.format('{yyyy}-{MM}-{dd}');

        this.openPane('addaction', campParam, dateParam);
    }

    onCalendarCopyAction(action, date) {
        const oldStartTime = new Date(action.start_time);
        const oldEndTime = new Date(action.end_time);

        const startTime = new Date(date);
        startTime.setHours(oldStartTime.getHours());
        startTime.setMinutes(oldStartTime.getMinutes());
        startTime.setSeconds(oldStartTime.getSeconds());

        const endTime = new Date(date);
        endTime.setHours(oldEndTime.getHours());
        endTime.setMinutes(oldEndTime.getMinutes());
        endTime.setSeconds(oldEndTime.getSeconds());

        const newAction = {
            activity_id: action.activity.id,
            location_id: action.location.id,
            info_text: action.info_text,
            num_participants_required: action.num_participants_required,

            // Use new start and end times
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString()
        };

        this.props.dispatch(createAction(action.campaign.id, newAction));
    }

    onCalendarMoveAction(action, date) {
        const oldStartTime = new Date(action.start_time);
        const oldEndTime = new Date(action.end_time);

        const startTime = new Date(date);
        startTime.setHours(oldStartTime.getHours());
        startTime.setMinutes(oldStartTime.getMinutes());
        startTime.setSeconds(oldStartTime.getSeconds());

        const endTime = new Date(date);
        endTime.setHours(oldEndTime.getHours());
        endTime.setMinutes(oldEndTime.getMinutes());
        endTime.setSeconds(oldEndTime.getSeconds());

        const values = {
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString()
        };

        this.props.dispatch(updateAction(action.id, values));
    }

    onSelectDay(date) {
        const dateStr = date.format('{yyyy}-{MM}-{dd}');
        this.openPane('actionday', dateStr);
    }

    onSelectAction(action, ev) {
        if (ev && ev.altKey) {
            this.openPane('editaction', action.id);
        }
        else {
            this.openPane('action', action.id);
        }
    }

    onEditCampaign(campaign) {
        this.openPane('editcampaign', campaign.id);
    }

    onCreateCampaign(title) {
        this.openPane('addcampaign', title);
    }
}
