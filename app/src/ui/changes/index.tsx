import * as React from 'react'
import { ChangesList } from './changes-list'
import FileDiff from '../file-diff'
import { IChangesState } from '../../lib/app-state'
import Repository from '../../models/repository'
import { Dispatcher } from '../../lib/dispatcher'

interface IChangesProps {
  repository: Repository
  changes: IChangesState
  dispatcher: Dispatcher
}

/** TODO: handle "repository not found" scenario */

export class Changes extends React.Component<IChangesProps, void> {
  private onCreateCommit(title: string) {
    this.props.dispatcher.commitSelectedChanges(this.props.repository, title)
  }

  private onSelectionChanged(row: number) {
    const file = this.props.changes.workingDirectory.files[row]
    this.props.dispatcher.changeChangesSelection(this.props.repository, file.path)
  }

  private onIncludeChanged(row: number, include: boolean) {

    const workingDirectory = this.props.changes.workingDirectory

    const foundFile = workingDirectory.files[row]

    if (!foundFile) {
      console.error('unable to find working directory path to apply included change: ' + row)
      return
    }

    foundFile.include = include

    const allSelected = workingDirectory.files.every((f, index, array) => {
      return f.include
    })

    const noneSelected = workingDirectory.files.every((f, index, array) => {
      return !f.include
    })

    if (allSelected && !noneSelected) {
      workingDirectory.includeAll = true
    } else if (!allSelected && noneSelected) {
      workingDirectory.includeAll = false
    } else {
      workingDirectory.includeAll = null
    }

    this.setState(Object.assign({}, this.state, { workingDirectory: workingDirectory }))
  }

  private onSelectAll(selectAll: boolean) {
    const workingDirectory = this.props.changes.workingDirectory

    workingDirectory.includeAll = selectAll
    workingDirectory.includeAllFiles(selectAll)

    this.setState(Object.assign({}, this.state, { workingDirectory: workingDirectory }))
  }

  private renderNoSelection() {
    return (
      <div id='changes'>
        <div>No repo selected!</div>
      </div>
    )
  }

  public render() {

    const repo = this.props.repository
    if (!repo) {
      return this.renderNoSelection()
    }

    const selectedFile = this.props.changes.workingDirectory.files.find(f => {
      return f.path === this.props.changes.selectedPath
    })

    return (
      <div id='changes'>
        <ChangesList repository={this.props.repository}
                     workingDirectory={this.props.changes.workingDirectory}
                     selectedPath={this.props.changes.selectedPath!}
                     onSelectionChanged={event => this.onSelectionChanged(event)}
                     onCreateCommit={title => this.onCreateCommit(title)}
                     onIncludeChanged={(row, include) => this.onIncludeChanged(row, include) }
                     onSelectAll={selectAll => this.onSelectAll(selectAll) }/>

         <FileDiff repository={this.props.repository}
                   file={selectedFile ? selectedFile : null}
                   readOnly={false}
                   commit={null} />
      </div>
    )
  }
}
