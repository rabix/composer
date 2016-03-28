/**
 * Created by filip on 2/20/15.
 */
'use strict';
angular.module('registryApp.dyole')
    .constant('rawPipeline', {
        display: {
            canvas: {
                x: 0,
                y: 0,
                zoom: 1
            },
            nodes: {}
        },
        nodes: [],
        relations: [],
        schemas: {}
    })
    .constant('rawRabixWorkflow', {
        'class': 'Workflow',
        'steps': [],
        'dataLinks': [],
        'inputs': [],
        'outputs': []
    })
    .constant('systemNodeModel', {
        'class': 'CommandLineTool',
        'id': null,
        'label': 'System app',
        'softwareDescription': {
            'repo_owner': 'rabix',
            'repo_name': 'system',
            'type': ''
        },
        'inputs': [],
        'outputs': []
    });