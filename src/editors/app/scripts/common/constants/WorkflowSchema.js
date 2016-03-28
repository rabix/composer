/**
 * Created by filip on 3/18/15.
 */

'use strict';

var Schema = {
    $schema: 'http://json-schema.org/schema#',
    type: 'object',
    definitions: {
        schemaDef: {
            type: 'array',
            minItems: 1,
            items: {
                oneOf: [
                    {
                        type: 'object',
                        properties: {
                            type: {
                                $ref: '#/definitions/stringTypeDef'
                            }
                        },
                        required: ['type']
                    },
                    {
                        $ref: '#/definitions/enumDef'
                    },
                    {
                        $ref: '#/definitions/arrayDef'
                    },
                    {
                        $ref: '#/definitions/stringTypeDef'
                    },
                    {
                        $ref: '#/definitions/recordDef'
                    }
                ]
            }
        },
        stringTypeDef: {
            type: 'string',
            enum: ['string', 'boolean', 'File', 'file', 'float', 'int', 'null']
        },
        enumDef: {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    enum: ['enum']
                },
                name: {
                    type: 'string'
                },
                symbols: {
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                }
            },
            required: ['type', 'name', 'symbols']
        },
        arrayDef: {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    enum: ['array']
                },
                items: {
                    oneOf: [
                        {
                            $ref: '#/definitions/enumDef'
                        },
                        {
                            type: 'object',
                            properties: {
                                type: {
                                    $ref: '#/definitions/stringTypeDef'
                                }
                            },
                            required: ['type']
                        },
                        {
                            $ref: '#/definitions/recordDef'
                        },
                        {
                            $ref: '#/definitions/stringTypeDef'
                        }
                    ]
                }
            },
            required: ['type', 'items']
        },
        recordDef: {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    enum: ['record']
                },
                fields: {
                    $ref: '#/definitions/fieldsDef'
                }
            },
            required: ['type', 'fields']
        },
        fieldsDef: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    type: {
                        $ref: '#/definitions/schemaDef'
                    },
                    name: {
                        type: 'string'
                    },
                    adapter: {
                        type: 'object'
                    }
                },
                required: ['type', 'name']
            }
        },
        adapterDef: {
            type: 'object',
            properties: {
                position: {
                    type: 'number'
                },
                valueFrom: {
                    oneOf: [
                        {
                            type: ['string', 'number']
                        },
                        {
                            type: 'object',
                            properties: {
                                'class': {
                                    type: 'string'
                                },
                                lang: {
                                    type: 'string'
                                },
                                value: {
                                    type: 'string'
                                }
                            }
                        }
                    ]
                },
                separate: {
                    type: 'boolean'
                },
                prefix: {
                    type: 'string'
                }
            }
        }
    },
    properties: {
        'id': {
            type: 'string'
        },
        'class': {
            type: 'string',
            enum: ['Workflow']
        },
        label: {
            type: 'string'
        },
        description: {
            type: 'string'
        },
        dataLinks: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    destination: {
                        type: 'string'
                    },
                    source: {
                        type: 'string'
                    }
                },
                required: ['destination', 'source']
            }
        },
        steps: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    run: {
                        oneOf: [{
                            type: 'object',
                            properties: {},
                            required: []
                        }, {
                            type: 'string'
                        }]
                    },
                    'id': {
                        type: 'string',
                        format: 'validateId'
                    },
                    inputs: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                'id': {
                                    type: 'string',
                                    format: 'validateId'
                                }
                            },
                            required: ['id']
                        }
                    },
                    outputs: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                'id': {
                                    type: 'string',
                                    format: 'validateId'
                                }
                            },
                            required: ['id']
                        }
                    }
                },
                required: ['inputs', 'outputs', 'id', 'run']
            }
        },
        inputs: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    type: {
                        $ref: '#/definitions/schemaDef'
                    },
                    'id': {
                        type: 'string',
                        format: 'validateId'
                    },
                    name: {
                        type: 'string'
                    },
                    label: {
                        type: 'string'
                    },
                    inputBinding: {
                        oneOf: [
                            {
                                $ref: '#/definitions/adapterDef'
                            },
                            {
                                // TODO: Temp hack, remove when you figure out why sometimes inputBinding when its not present is undefined
                                type: ['undefined', 'null']
                            }
                        ]
                    }
                },
                required: ['type', 'id']
            }
        },
        outputs: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    'id': {
                        type: 'string',
                        format: 'validateId'
                    },
                    type: {
                        $ref: '#/definitions/schemaDef'
                    }
                },
                required: ['type', 'id']
            }
        }
    },
    required: ['id', 'class', 'label', 'inputs', 'outputs']
};

angular.module('registryApp.common')
    .constant('workflowSchemaDefs', Schema);
