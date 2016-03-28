/**
 * Created by filip on 3/18/15.
 */

'use strict';

var Schema = {
    $schema: 'http://json-schema.org/schema#',
    type: 'object',
    definitions: {
        /**
         * @typedef {string[]|EnumType[]|ArrayType[]|RecordType[]|MapType[]} Type
         */
        schemaDef: {
            type: 'array',
            minItems: 1,
            items: {
                oneOf: [
                    {
                        $ref: '#/definitions/recordDef'
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
                        $ref: '#/definitions/mapDef'
                    },
                    {
                        type: 'object',
                        properties: {
                            type: {
                                $ref: '#/definitions/stringTypeDef'
                            }
                        },
                        required: ['type']
                    }
                ]
            }
        },
        stringTypeDef: {
            type: 'string',
            enum: ['string', 'boolean', 'File', 'float', 'int', 'null']
        },
        /**
         * @typedef {object} EnumType
         * @extends Type
         *
         * @property {string} type always 'enum'
         * @property {string} name
         * @property {string[]} symbols
         */
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
        /**
         * @typedef {object} ArrayType
         *
         * @property {string} type  always 'array'
         * @property {string|EnumType|RecordType|MapType} items
         */
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
                            type: 'string'
                        },
                        {
                            $ref: '#/definitions/recordDef'
                        },
                        {
                            $ref: '#/definitions/mapDef'
                        },
                        {
                            $ref: '#/definitions/enumDef'
                        }
                    ]
                }
            },
            required: ['type', 'items']
        },
        /**
         * @typedef {object} RecordType
         *
         * @property {string} type  always 'record'
         * @property {Input[]} fields
         */
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
        /**
         * @typedef {object} MapType
         *
         * @property {string} type  always 'map'
         * @property {string} values  currently always 'string'
         */
        mapDef: {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    enum: ['map']
                },
                values: {
                    // currently only strings are supported as values type
                    type: 'string',
                    enum: ['string']
                }
            }
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
                    inputBinding: {
                        type: 'object'
                    },
                    outputBinding: {
                        type: 'object'
                    }
                },
                required: ['type', 'name']
            }
        },
        /**
         * @typedef {object} Binding
         *
         * @property {number} position
         * @property {Expression} valueFrom
         * @property {boolean} separate
         * @property {string} prefix
         * @property {string|null} itemSeparator
         */
        adapterDef: {
            type: 'object',
            properties: {
                position: {
                    type: 'number'
                },
                /**
                 * @typedef {string|number|object} Expression
                 * @property {string} [class]
                 * @property {string} [engine]
                 * @property {string} [script]
                 */
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
                                engine: {
                                    type: 'string'
                                },
                                script: {
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
            enum: ['CommandLineTool']
        },
        label: {
            type: 'string'
        },
        description: {
            type: 'string'
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
                            }
                        },
                        required: ['class']
                    }
                ]
            }
        },
        inputs: {
            type: 'array',
            items: {
                /**
                 * @typedef {object} Input
                 * @property {string} id
                 * @property {Type} type
                 * @property {string} [name]
                 * @property {Binding} [inputBinding]
                 */
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
                        oneOf: [
                            {
                                $ref: '#/definitions/adapterDef'
                            },
                            {
                                type: ['null']
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
                /**
                 * @typedef {object} Output
                 * @property {string} id
                 * @property {Type} type
                 * @property {string} [name]
                 * @property {Binding} [outputBinding]
                 */
                type: 'object',
                properties: {
                    'id': {
                        type: 'string',
                        format: 'validateId'
                    },
                    type: {
                        $ref: '#/definitions/schemaDef'
                    },
                    outputBinding: {
                        $ref: '#/definitions/adapterDef'
                    }
                },
                required: ['type', 'id']
            }
        },
        baseCommand: {
            type: ['string', 'array']
        },
        stdIn: {
            type: ['string', 'object']
        },
        stdOut: {
            type: ['string', 'object']
        },
        successCodes: {
            type: 'array'
        },
        arguments: {
            type: 'array',
            /**
             * @typedef {object} Argument
             * @description Type of Binding that is applied directly to the tool
             * @augments Binding
             */
            items: {
                $ref: '#/definitions/adapterDef'
            }
        }
    },
    required: ['id', 'class', 'baseCommand', 'arguments', 'label', 'inputs', 'outputs']
};

angular.module('registryApp.common')
    .constant('toolSchemaDefs', Schema);

