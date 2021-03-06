import cx from 'classnames';
import React from 'react';
import DropZone from 'react-dropzone';
import { connect } from 'react-redux';
import { FormattedMessage as Msg } from 'react-intl';

import Button from '../../misc/Button';
import RootPaneBase from '../RootPaneBase';
import ImporterTableSet from '../../misc/importer/ImporterTableSet';
import LoadingIndicator from '../../misc/LoadingIndicator';
import {
    parseImportFile,
    resetImport,
    resetImportError
} from '../../../actions/importer';


@connect(state => ({ importer: state.importer }))
export default class ImportPane extends RootPaneBase {
    constructor(props) {
        super(props);

        this.state = {
            isDragging: false,
        };
    }

    renderPaneContent(data) {
        let classes = cx('ImportPane-dropZone', {
            'ImportPane-dropZone-isDragging': this.state.isDragging,
        });

        let tableSet = this.props.importer.tableSet;
        let stats = this.props.importer.importStats;
        let isPending = this.props.importer.importIsPending;
        let error = this.props.importer.importError;

        if (isPending) {
            return <LoadingIndicator />;
        }
        else if (error) {
            return (
                <div className="ImportPane-error">
                    <Msg tagName="h1" id="panes.import.error.h"/>
                    <Msg tagName="p" id="panes.import.error.p"/>
                    <Button labelMsg="panes.import.error.backButton"
                        onClick={ this.onErrorBackButtonClick.bind(this) }
                        />
                    <Button labelMsg="panes.import.error.resetButton"
                        onClick={ this.onErrorResetButtonClick.bind(this) }
                        />
                </div>
            );
        }
        else if (tableSet) {
            return (
                <ImporterTableSet tableSet={ tableSet }
                    onEditColumn={ this.onEditColumn.bind(this) }
                    dispatch={ this.props.dispatch }/>
            );
        }
        else if (stats) {
            return (
                <div className="ImportPane-report">
                    <Msg tagName="h1" id="panes.import.report.h"
                        values={{ count: stats.imported }}/>
                    <ul>
                        <li><Msg id="panes.import.report.numCreated"
                            values={{ count: stats.created }}/></li>
                        <li><Msg id="panes.import.report.numUpdated"
                            values={{ count: stats.updated }}/></li>
                        <li><Msg id="panes.import.report.numTagged"
                            values={{ count: stats.tagged }}/></li>
                    </ul>
                    <Button labelMsg="panes.import.importMoreButton"
                        onClick={ this.onClickReset.bind(this) }/>
                </div>
            );
        }
        else {
            return [
                <DropZone key="dropZone" className={ classes }
                    onDragEnter={ this.onDragEnter.bind(this) }
                    onDragLeave={ this.onDragLeave.bind(this) }
                    onDrop={ this.onDrop.bind(this) }>
                    <div className="ImportPane-dropZoneMessage" >
                        <Msg tagName="p" id="panes.import.importDropZoneMessage"/>
                    </div>
                </DropZone>
            ];
        }
    }

    onEditColumn(table, col) {
        this.openPane('importercolumn', table.id, col.id);
    }

    onDragEnter(ev) {
        this.setState({
            isDragging: true,
        });
    }

    onDragLeave(ev) {
        this.setState({
            isDragging: false,
        });
    }

    onDrop(files) {
        this.setState({
            isDragging: false,
        });

        // TODO: Check file count, format et c

        let file = files[0];
        this.props.dispatch(parseImportFile(file));
    }

    onClickReset() {
        this.props.dispatch(resetImport());
    }

    onErrorBackButtonClick() {
        this.props.dispatch(resetImportError());
    }

    onErrorResetButtonClick() {
        this.props.dispatch(resetImport());
    }
}
