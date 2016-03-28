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
            enum: ['string', 'boolean', 'float', 'int', 'null', 'File']
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
        },
        expressionDef: {
            type: 'object',
            properties: {
                'class': {
                    type: 'string'
                },
                engine: {
                    type: 'string'
                },
                script: {
                    type: 'string'
                }
            },
            required: ['class', 'engine', 'script']
        }
    },
    properties: {
        'id': {
            type: 'string'
        },
        'class': {
            type: 'string',
            enum: ['ExpressionTool']
        },
        '@context': {
            type: 'string'
        },
        label: {
            type: 'string'
        },
        description: {
            type: 'string'
        },
        owner: {
            type: 'array'
        },
        contributor: {
            type: 'array'
        },
        requirements: {
            type: 'array',
            items: {
                anyOf: [
                    { // validation for Docker Container requirement
                        type: 'object',
                        properties: {
                            'class': {
                                type: 'string',
                                enum: ['DockerRequirement']
                            },
                            dockerPull: {
                                type: 'string'
                            },
                            dockerImageId: {
                                type: 'string'
                            }
                        },
                        required: ['class']
                    },
                    { // validation for CPU and Mem requirements
                        type: 'object',
                        properties: {
                            'class': {
                                type: 'string',
                                enum: ['CPURequirement', 'MemRequirement']
                            },
                            value: {
                                type: ['number', 'object'],
                                properties: {
                                    'class': {
                                        type: 'string'
                                    },
                                    lang: {
                                        type: 'string'
                                    },
                                    value: {
                                        type: ['string', 'number']
                                    }
                                },
                                required: ['class', 'lang', 'value']
                            }
                        },
                        required: ['class', 'value']
                    },
                    { //Some other (unknown) requirement
                        type: 'object',
                        properties: {
                            'class': {
                                type: 'string'
                            },
                            required: ['class']
                        }
                    }
                ]
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
                    inputBinding: {
                        $ref: '#/definitions/adapterDef'
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
        },
        engine: {
            type: 'string'
        },
        successCodes: {
            type: 'array'
        },
        script: {
            type: 'string'
        }
    },
    required: ['id', 'class', '@context', 'label', 'inputs', 'outputs']
};

angular.module('registryApp.common')
    .constant('scriptSchemaDefs', Schema);

