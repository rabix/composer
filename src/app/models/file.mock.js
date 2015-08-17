/**
 * Created by majanedeljkovic on 8/14/15.
 */

export const json =
`{
    "id": "https://brood.sbgenomics.com/v1/apps/maya/test-project/cwl-test/0/",
    "class": "CommandLineTool",
    "@context": "https://github.com/common-workflow-language/common-workflow-language/blob/draft-1/specification/tool-description.md",
    "label": "cwl-test",
    "description": "description field",
    "owner": [],
    "contributor": [],
    "requirements": [{
        "class": "DockerRequirement",
        "dockerImageId": "",
        "dockerPull": ""
    }, {
        "class": "CPURequirement",
        "value": 1
    }, {
        "class": "MemRequirement",
        "value": 1000
    }],
    "inputs": [{
        "type": ["null", {
            "type": "array",
            "items": "File"
        }],
        "inputBinding": {
            "sbg:cmdInclude": "true",
            "separate": true,
            "position": 0,
            "prefix": "--f"
        },
        "id": "#arr_file",
        "description": "",
        "label": "",
        "sbg:category": ""
    }],
    "outputs": [{
        "type": ["null", "File"],
        "outputBinding": {
            "glob": "*.txt"
        },
        "id": "#output"
    }],
    "baseCommand": ["basecmd"],
    "stdin": "",
    "stdout": "",
    "successCodes": [],
    "temporaryFailCodes": [],
    "arguments": [{
        "separate": false,
        "valueFrom": "asdf",
        "prefix": "-arg=",
        "position": 3
    }],
    "sbg:createdBy": "maya",
    "sbg:modifiedOn": 1439551302,
    "sbg:projectId": "a0c633e2-7082-4589-b514-f3692149c475",
    "sbg:revision": 0,
    "sbg:revisionsInfo": [{
        "sbg:modifiedBy": "maya",
        "sbg:modifiedOn": 1439551302,
        "sbg:revision": 0
    }],
    "sbg:validationErrors": ["Base command empty."],
    "sbg:createdOn": 1439551302,
    "sbg:sbgMaintained": false,
    "sbg:projectSlug": "maya/test-project",
    "sbg:modifiedBy": "maya",
    "sbg:contributors": ["maya"],
    "sbg:latestRevision": 0,
    "sbg:name": "cwl-test"
}`;

export const yaml =
`
---
  id: "https://brood.sbgenomics.com/v1/apps/maya/test-project/cwl-test/0/"
  class: "CommandLineTool"
  @context: "https://github.com/common-workflow-language/common-workflow-language/blob/draft-1/specification/tool-description.md"
  label: "cwl-test"
  description: "description field"
  owner: []
  contributor: []
  requirements:
    -
      class: "DockerRequirement"
      dockerImageId: ""
      dockerPull: ""
    -
      class: "CPURequirement"
      value: 1
    -
      class: "MemRequirement"
      value: 1000
  inputs:
    -
      type:
        - "null"
        -
          type: "array"
          items: "File"
      inputBinding:
        sbg:cmdInclude: "true"
        separate: true
        position: 0
        prefix: "--f"
      id: "#arr_file"
      description: ""
      label: ""
      sbg:category: ""
  outputs:
    -
      type:
        - "null"
        - "File"
      outputBinding:
        glob: "*.txt"
      id: "#output"
  baseCommand:
    - "basecmd"
  stdin: ""
  stdout: ""
  successCodes: []
  temporaryFailCodes: []
  arguments:
    -
      separate: false
      valueFrom: "asdf"
      prefix: "-arg="
      position: 3
  sbg:createdBy: "maya"
  sbg:modifiedOn: 1439551302
  sbg:projectId: "a0c633e2-7082-4589-b514-f3692149c475"
  sbg:revision: 0
  sbg:revisionsInfo:
    -
      sbg:modifiedBy: "maya"
      sbg:modifiedOn: 1439551302
      sbg:revision: 0
  sbg:validationErrors:
    - "Base command empty."
  sbg:createdOn: 1439551302
  sbg:sbgMaintained: false
  sbg:projectSlug: "maya/test-project"
  sbg:modifiedBy: "maya"
  sbg:contributors:
    - "maya"
  sbg:latestRevision: 0
  sbg:name: "cwl-test"
`;