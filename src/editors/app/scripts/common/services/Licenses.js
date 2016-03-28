/**
 * created by maya on 17.9.2015.
 */

'use strict';

angular.module('registryApp.common')
    .service('Licenses', ['$http', function() {
        function getLicenses() {
            /**
             * licenses copied from https://github.com/sindresorhus/spdx-license-list
             */
            return {
                'Glide': {
                    name: '3dfx Glide License',
                    osiApproved: false
                },
                'Abstyles': {
                    name: 'Abstyles License',
                    osiApproved: false
                },
                'AFL-1.1': {
                    name: 'Academic Free License v1.1',
                    osiApproved: true
                },
                'AFL-1.2': {
                    name: 'Academic Free License v1.2',
                    osiApproved: true
                },
                'AFL-2.0': {
                    name: 'Academic Free License v2.0',
                    osiApproved: true
                },
                'AFL-2.1': {
                    name: 'Academic Free License v2.1',
                    osiApproved: true
                },
                'AFL-3.0': {
                    name: 'Academic Free License v3.0',
                    osiApproved: true
                },
                'AMPAS': {
                    name: 'Academy of Motion Picture Arts and Sciences BSD',
                    osiApproved: false
                },
                'APL-1.0': {
                    name: 'Adaptive Public License 1.0',
                    osiApproved: true
                },
                'Adobe-Glyph': {
                    name: 'Adobe Glyph List License',
                    osiApproved: false
                },
                'APAFML': {
                    name: 'Adobe Postscript AFM License',
                    osiApproved: false
                },
                'Adobe-2006': {
                    name: 'Adobe Systems Incorporated Source Code License Agreement',
                    osiApproved: false
                },
                'AGPL-1.0': {
                    name: 'Affero General Public License v1.0',
                    osiApproved: false
                },
                'Afmparse': {
                    name: 'Afmparse License',
                    osiApproved: false
                },
                'Aladdin': {
                    name: 'Aladdin Free Public License',
                    osiApproved: false
                },
                'ADSL': {
                    name: 'Amazon Digital Services License',
                    osiApproved: false
                },
                'AMDPLPA': {
                    name: 'AMD\'s plpa_map.c License',
                    osiApproved: false
                },
                'ANTLR-PD': {
                    name: 'ANTLR Software Rights Notice',
                    osiApproved: false
                },
                'Apache-1.0': {
                    name: 'Apache License 1.0',
                    osiApproved: false
                },
                'Apache-1.1': {
                    name: 'Apache License 1.1',
                    osiApproved: true
                },
                'Apache-2.0': {
                    name: 'Apache License 2.0',
                    osiApproved: true
                },
                'AML': {
                    name: 'Apple MIT License',
                    osiApproved: false
                },
                'APSL-1.0': {
                    name: 'Apple Public Source License 1.0',
                    osiApproved: true
                },
                'APSL-1.1': {
                    name: 'Apple Public Source License 1.1',
                    osiApproved: true
                },
                'APSL-1.2': {
                    name: 'Apple Public Source License 1.2',
                    osiApproved: true
                },
                'APSL-2.0': {
                    name: 'Apple Public Source License 2.0',
                    osiApproved: true
                },
                'Artistic-1.0': {
                    name: 'Artistic License 1.0',
                    osiApproved: true
                },
                'Artistic-1.0-Perl': {
                    name: 'Artistic License 1.0 (Perl)',
                    osiApproved: true
                },
                'Artistic-1.0-cl8': {
                    name: 'Artistic License 1.0 w/clause 8',
                    osiApproved: true
                },
                'Artistic-2.0': {
                    name: 'Artistic License 2.0',
                    osiApproved: true
                },
                'AAL': {
                    name: 'Attribution Assurance License',
                    osiApproved: true
                },
                'Bahyph': {
                    name: 'Bahyph License',
                    osiApproved: false
                },
                'Barr': {
                    name: 'Barr License',
                    osiApproved: false
                },
                'Beerware': {
                    name: 'Beerware License',
                    osiApproved: false
                },
                'BitTorrent-1.0': {
                    name: 'BitTorrent Open Source License v1.0',
                    osiApproved: false
                },
                'BitTorrent-1.1': {
                    name: 'BitTorrent Open Source License v1.1',
                    osiApproved: false
                },
                'BSL-1.0': {
                    name: 'Boost Software License 1.0',
                    osiApproved: true
                },
                'Borceux': {
                    name: 'Borceux license',
                    osiApproved: false
                },
                'BSD-2-Clause': {
                    name: 'BSD 2-clause \'Simplified\' License',
                    osiApproved: true
                },
                'BSD-2-Clause-FreeBSD': {
                    name: 'BSD 2-clause FreeBSD License',
                    osiApproved: false
                },
                'BSD-2-Clause-NetBSD': {
                    name: 'BSD 2-clause NetBSD License',
                    osiApproved: false
                },
                'BSD-3-Clause': {
                    name: 'BSD 3-clause \'New\' or \'Revised\' License',
                    osiApproved: true
                },
                'BSD-3-Clause-Clear': {
                    name: 'BSD 3-clause Clear License',
                    osiApproved: false
                },
                'BSD-4-Clause': {
                    name: 'BSD 4-clause \'Original\' or \'Old\' License',
                    osiApproved: false
                },
                'BSD-Protection': {
                    name: 'BSD Protection License',
                    osiApproved: false
                },
                'BSD-3-Clause-Attribution': {
                    name: 'BSD with attribution',
                    osiApproved: false
                },
                'BSD-4-Clause-UC': {
                    name: 'BSD-4-Clause (University of California-Specific)',
                    osiApproved: false
                },
                'bzip2-1.0.5': {
                    name: 'bzip2 and libbzip2 License v1.0.5',
                    osiApproved: false
                },
                'bzip2-1.0.6': {
                    name: 'bzip2 and libbzip2 License v1.0.6',
                    osiApproved: false
                },
                'Caldera': {
                    name: 'Caldera License',
                    osiApproved: false
                },
                'CECILL-1.0': {
                    name: 'CeCILL Free Software License Agreement v1.0',
                    osiApproved: false
                },
                'CECILL-1.1': {
                    name: 'CeCILL Free Software License Agreement v1.1',
                    osiApproved: false
                },
                'CECILL-2.0': {
                    name: 'CeCILL Free Software License Agreement v2.0',
                    osiApproved: false
                },
                'CECILL-B': {
                    name: 'CeCILL-B Free Software License Agreement',
                    osiApproved: false
                },
                'CECILL-C': {
                    name: 'CeCILL-C Free Software License Agreement',
                    osiApproved: false
                },
                'ClArtistic': {
                    name: 'Clarified Artistic License',
                    osiApproved: false
                },
                'MIT-CMU': {
                    name: 'CMU License',
                    osiApproved: false
                },
                'CNRI-Jython': {
                    name: 'CNRI Jython License',
                    osiApproved: false
                },
                'CNRI-Python': {
                    name: 'CNRI Python License',
                    osiApproved: true
                },
                'CNRI-Python-GPL-Compatible': {
                    name: 'CNRI Python Open Source GPL Compatible License Agreement',
                    osiApproved: false
                },
                'CPOL-1.02': {
                    name: 'Code Project Open License 1.02',
                    osiApproved: false
                },
                'CDDL-1.0': {
                    name: 'Common Development and Distribution License 1.0',
                    osiApproved: true
                },
                'CDDL-1.1': {
                    name: 'Common Development and Distribution License 1.1',
                    osiApproved: false
                },
                'CPAL-1.0': {
                    name: 'Common Public Attribution License 1.0',
                    osiApproved: true
                },
                'CPL-1.0': {
                    name: 'Common Public License 1.0',
                    osiApproved: true
                },
                'CATOSL-1.1': {
                    name: 'Computer Associates Trusted Open Source License 1.1',
                    osiApproved: true
                },
                'Condor-1.1': {
                    name: 'Condor Public License v1.1',
                    osiApproved: false
                },
                'CC-BY-1.0': {
                    name: 'Creative Commons Attribution 1.0',
                    osiApproved: false
                },
                'CC-BY-2.0': {
                    name: 'Creative Commons Attribution 2.0',
                    osiApproved: false
                },
                'CC-BY-2.5': {
                    name: 'Creative Commons Attribution 2.5',
                    osiApproved: false
                },
                'CC-BY-3.0': {
                    name: 'Creative Commons Attribution 3.0',
                    osiApproved: false
                },
                'CC-BY-4.0': {
                    name: 'Creative Commons Attribution 4.0',
                    osiApproved: false
                },
                'CC-BY-ND-1.0': {
                    name: 'Creative Commons Attribution No Derivatives 1.0',
                    osiApproved: false
                },
                'CC-BY-ND-2.0': {
                    name: 'Creative Commons Attribution No Derivatives 2.0',
                    osiApproved: false
                },
                'CC-BY-ND-2.5': {
                    name: 'Creative Commons Attribution No Derivatives 2.5',
                    osiApproved: false
                },
                'CC-BY-ND-3.0': {
                    name: 'Creative Commons Attribution No Derivatives 3.0',
                    osiApproved: false
                },
                'CC-BY-ND-4.0': {
                    name: 'Creative Commons Attribution No Derivatives 4.0',
                    osiApproved: false
                },
                'CC-BY-NC-1.0': {
                    name: 'Creative Commons Attribution Non Commercial 1.0',
                    osiApproved: false
                },
                'CC-BY-NC-2.0': {
                    name: 'Creative Commons Attribution Non Commercial 2.0',
                    osiApproved: false
                },
                'CC-BY-NC-2.5': {
                    name: 'Creative Commons Attribution Non Commercial 2.5',
                    osiApproved: false
                },
                'CC-BY-NC-3.0': {
                    name: 'Creative Commons Attribution Non Commercial 3.0',
                    osiApproved: false
                },
                'CC-BY-NC-4.0': {
                    name: 'Creative Commons Attribution Non Commercial 4.0',
                    osiApproved: false
                },
                'CC-BY-NC-ND-1.0': {
                    name: 'Creative Commons Attribution Non Commercial No Derivatives 1.0',
                    osiApproved: false
                },
                'CC-BY-NC-ND-2.0': {
                    name: 'Creative Commons Attribution Non Commercial No Derivatives 2.0',
                    osiApproved: false
                },
                'CC-BY-NC-ND-2.5': {
                    name: 'Creative Commons Attribution Non Commercial No Derivatives 2.5',
                    osiApproved: false
                },
                'CC-BY-NC-ND-3.0': {
                    name: 'Creative Commons Attribution Non Commercial No Derivatives 3.0',
                    osiApproved: false
                },
                'CC-BY-NC-ND-4.0': {
                    name: 'Creative Commons Attribution Non Commercial No Derivatives 4.0',
                    osiApproved: false
                },
                'CC-BY-NC-SA-1.0': {
                    name: 'Creative Commons Attribution Non Commercial Share Alike 1.0',
                    osiApproved: false
                },
                'CC-BY-NC-SA-2.0': {
                    name: 'Creative Commons Attribution Non Commercial Share Alike 2.0',
                    osiApproved: false
                },
                'CC-BY-NC-SA-2.5': {
                    name: 'Creative Commons Attribution Non Commercial Share Alike 2.5',
                    osiApproved: false
                },
                'CC-BY-NC-SA-3.0': {
                    name: 'Creative Commons Attribution Non Commercial Share Alike 3.0',
                    osiApproved: false
                },
                'CC-BY-NC-SA-4.0': {
                    name: 'Creative Commons Attribution Non Commercial Share Alike 4.0',
                    osiApproved: false
                },
                'CC-BY-SA-1.0': {
                    name: 'Creative Commons Attribution Share Alike 1.0',
                    osiApproved: false
                },
                'CC-BY-SA-2.0': {
                    name: 'Creative Commons Attribution Share Alike 2.0',
                    osiApproved: false
                },
                'CC-BY-SA-2.5': {
                    name: 'Creative Commons Attribution Share Alike 2.5',
                    osiApproved: false
                },
                'CC-BY-SA-3.0': {
                    name: 'Creative Commons Attribution Share Alike 3.0',
                    osiApproved: false
                },
                'CC-BY-SA-4.0': {
                    name: 'Creative Commons Attribution Share Alike 4.0',
                    osiApproved: false
                },
                'CC0-1.0': {
                    name: 'Creative Commons Zero v1.0 Universal',
                    osiApproved: false
                },
                'Crossword': {
                    name: 'Crossword License',
                    osiApproved: false
                },
                'CUA-OPL-1.0': {
                    name: 'CUA Office Public License v1.0',
                    osiApproved: true
                },
                'Cube': {
                    name: 'Cube License',
                    osiApproved: false
                },
                'D-FSL-1.0': {
                    name: 'Deutsche Freie Software Lizenz',
                    osiApproved: false
                },
                'diffmark': {
                    name: 'diffmark license',
                    osiApproved: false
                },
                'WTFPL': {
                    name: 'Do What The F*ck You Want To Public License',
                    osiApproved: false
                },
                'DOC': {
                    name: 'DOC License',
                    osiApproved: false
                },
                'Dotseqn': {
                    name: 'Dotseqn License',
                    osiApproved: false
                },
                'DSDP': {
                    name: 'DSDP License',
                    osiApproved: false
                },
                'dvipdfm': {
                    name: 'dvipdfm License',
                    osiApproved: false
                },
                'EPL-1.0': {
                    name: 'Eclipse Public License 1.0',
                    osiApproved: true
                },
                'ECL-1.0': {
                    name: 'Educational Community License v1.0',
                    osiApproved: true
                },
                'ECL-2.0': {
                    name: 'Educational Community License v2.0',
                    osiApproved: true
                },
                'eGenix': {
                    name: 'eGenix.com Public License 1.1.0',
                    osiApproved: false
                },
                'EFL-1.0': {
                    name: 'Eiffel Forum License v1.0',
                    osiApproved: true
                },
                'EFL-2.0': {
                    name: 'Eiffel Forum License v2.0',
                    osiApproved: true
                },
                'MIT-advertising': {
                    name: 'Enlightenment License (e16)',
                    osiApproved: false
                },
                'MIT-enna': {
                    name: 'enna License',
                    osiApproved: false
                },
                'Entessa': {
                    name: 'Entessa Public License v1.0',
                    osiApproved: true
                },
                'ErlPL-1.1': {
                    name: 'Erlang Public License v1.1',
                    osiApproved: false
                },
                'EUDatagrid': {
                    name: 'EU DataGrid Software License',
                    osiApproved: true
                },
                'EUPL-1.0': {
                    name: 'European Union Public License 1.0',
                    osiApproved: false
                },
                'EUPL-1.1': {
                    name: 'European Union Public License 1.1',
                    osiApproved: true
                },
                'Eurosym': {
                    name: 'Eurosym License',
                    osiApproved: false
                },
                'Fair': {
                    name: 'Fair License',
                    osiApproved: true
                },
                'MIT-feh': {
                    name: 'feh License',
                    osiApproved: false
                },
                'Frameworx-1.0': {
                    name: 'Frameworx Open License 1.0',
                    osiApproved: true
                },
                'FreeImage': {
                    name: 'FreeImage Public License v1.0',
                    osiApproved: false
                },
                'FTL': {
                    name: 'Freetype Project License',
                    osiApproved: false
                },
                'FSFUL': {
                    name: 'FSF Unlimited License',
                    osiApproved: false
                },
                'FSFULLR': {
                    name: 'FSF Unlimited License (with License Retention)',
                    osiApproved: false
                },
                'Giftware': {
                    name: 'Giftware License',
                    osiApproved: false
                },
                'GL2PS': {
                    name: 'GL2PS License',
                    osiApproved: false
                },
                'Glulxe': {
                    name: 'Glulxe License',
                    osiApproved: false
                },
                'AGPL-3.0': {
                    name: 'GNU Affero General Public License v3.0',
                    osiApproved: true
                },
                'GFDL-1.1': {
                    name: 'GNU Free Documentation License v1.1',
                    osiApproved: false
                },
                'GFDL-1.2': {
                    name: 'GNU Free Documentation License v1.2',
                    osiApproved: false
                },
                'GFDL-1.3': {
                    name: 'GNU Free Documentation License v1.3',
                    osiApproved: false
                },
                'GPL-1.0': {
                    name: 'GNU General Public License v1.0 only',
                    osiApproved: false
                },
                'GPL-2.0': {
                    name: 'GNU General Public License v2.0 only',
                    osiApproved: true
                },
                'GPL-3.0': {
                    name: 'GNU General Public License v3.0 only',
                    osiApproved: true
                },
                'LGPL-2.1': {
                    name: 'GNU Lesser General Public License v2.1 only',
                    osiApproved: true
                },
                'LGPL-3.0': {
                    name: 'GNU Lesser General Public License v3.0 only',
                    osiApproved: true
                },
                'LGPL-2.0': {
                    name: 'GNU Library General Public License v2 only',
                    osiApproved: true
                },
                'gnuplot': {
                    name: 'gnuplot License',
                    osiApproved: false
                },
                'gSOAP-1.3b': {
                    name: 'gSOAP Public License v1.3b',
                    osiApproved: false
                },
                'HaskellReport': {
                    name: 'Haskell Language Report License',
                    osiApproved: false
                },
                'HPND': {
                    name: 'Historic Permission Notice and Disclaimer',
                    osiApproved: true
                },
                'IBM-pibs': {
                    name: 'IBM PowerPC Initialization and Boot Software',
                    osiApproved: false
                },
                'IPL-1.0': {
                    name: 'IBM Public License v1.0',
                    osiApproved: true
                },
                'ICU': {
                    name: 'ICU License',
                    osiApproved: false
                },
                'ImageMagick': {
                    name: 'ImageMagick License',
                    osiApproved: false
                },
                'iMatix': {
                    name: 'iMatix Standard Function Library Agreement',
                    osiApproved: false
                },
                'Imlib2': {
                    name: 'Imlib2 License',
                    osiApproved: false
                },
                'IJG': {
                    name: 'Independent JPEG Group License',
                    osiApproved: false
                },
                'Intel-ACPI': {
                    name: 'Intel ACPI Software License Agreement',
                    osiApproved: false
                },
                'Intel': {
                    name: 'Intel Open Source License',
                    osiApproved: true
                },
                'IPA': {
                    name: 'IPA Font License',
                    osiApproved: true
                },
                'ISC': {
                    name: 'ISC License',
                    osiApproved: true
                },
                'JasPer-2.0': {
                    name: 'JasPer License',
                    osiApproved: false
                },
                'JSON': {
                    name: 'JSON License',
                    osiApproved: false
                },
                'LPPL-1.3a': {
                    name: 'LaTeX Project Public License 1.3a',
                    osiApproved: false
                },
                'LPPL-1.0': {
                    name: 'LaTeX Project Public License v1.0',
                    osiApproved: false
                },
                'LPPL-1.1': {
                    name: 'LaTeX Project Public License v1.1',
                    osiApproved: false
                },
                'LPPL-1.2': {
                    name: 'LaTeX Project Public License v1.2',
                    osiApproved: false
                },
                'LPPL-1.3c': {
                    name: 'LaTeX Project Public License v1.3c',
                    osiApproved: true
                },
                'Latex2e': {
                    name: 'Latex2e License',
                    osiApproved: false
                },
                'BSD-3-Clause-LBNL': {
                    name: 'Lawrence Berkeley National Labs BSD variant license',
                    osiApproved: false
                },
                'Leptonica': {
                    name: 'Leptonica License',
                    osiApproved: false
                },
                'Libpng': {
                    name: 'libpng License',
                    osiApproved: false
                },
                'libtiff': {
                    name: 'libtiff License',
                    osiApproved: false
                },
                'LPL-1.02': {
                    name: 'Lucent Public License v1.02',
                    osiApproved: true
                },
                'LPL-1.0': {
                    name: 'Lucent Public License Version 1.0',
                    osiApproved: true
                },
                'MakeIndex': {
                    name: 'MakeIndex License',
                    osiApproved: false
                },
                'MTLL': {
                    name: 'Matrix Template Library License',
                    osiApproved: false
                },
                'MS-PL': {
                    name: 'Microsoft Public License',
                    osiApproved: true
                },
                'MS-RL': {
                    name: 'Microsoft Reciprocal License',
                    osiApproved: true
                },
                'MirOS': {
                    name: 'MirOS Licence',
                    osiApproved: true
                },
                'MITNFA': {
                    name: 'MIT +no-false-attribs license',
                    osiApproved: false
                },
                'MIT': {
                    name: 'MIT License',
                    osiApproved: true,
                    'isPopular': true
                },
                'Motosoto': {
                    name: 'Motosoto License',
                    osiApproved: true
                },
                'MPL-1.0': {
                    name: 'Mozilla Public License 1.0',
                    osiApproved: true
                },
                'MPL-1.1': {
                    name: 'Mozilla Public License 1.1',
                    osiApproved: true
                },
                'MPL-2.0': {
                    name: 'Mozilla Public License 2.0',
                    osiApproved: true
                },
                'MPL-2.0-no-copyleft-exception': {
                    name: 'Mozilla Public License 2.0 (no copyleft exception)',
                    osiApproved: true
                },
                'mpich2': {
                    name: 'mpich2 License',
                    osiApproved: false
                },
                'Multics': {
                    name: 'Multics License',
                    osiApproved: true
                },
                'Mup': {
                    name: 'Mup License',
                    osiApproved: false
                },
                'NASA-1.3': {
                    name: 'NASA Open Source Agreement 1.3',
                    osiApproved: true
                },
                'Naumen': {
                    name: 'Naumen Public License',
                    osiApproved: true
                },
                'NBPL-1.0': {
                    name: 'Net Boolean Public License v1',
                    osiApproved: false
                },
                'NetCDF': {
                    name: 'NetCDF license',
                    osiApproved: false
                },
                'NGPL': {
                    name: 'Nethack General Public License',
                    osiApproved: true
                },
                'NOSL': {
                    name: 'Netizen Open Source License',
                    osiApproved: false
                },
                'NPL-1.0': {
                    name: 'Netscape Public License v1.0',
                    osiApproved: false
                },
                'NPL-1.1': {
                    name: 'Netscape Public License v1.1',
                    osiApproved: false
                },
                'Newsletr': {
                    name: 'Newsletr License',
                    osiApproved: false
                },
                'NLPL': {
                    name: 'No Limit Public License',
                    osiApproved: false
                },
                'Nokia': {
                    name: 'Nokia Open Source License',
                    osiApproved: true
                },
                'NPOSL-3.0': {
                    name: 'Non-Profit Open Software License 3.0',
                    osiApproved: true
                },
                'Noweb': {
                    name: 'Noweb License',
                    osiApproved: false
                },
                'NRL': {
                    name: 'NRL License',
                    osiApproved: false
                },
                'NTP': {
                    name: 'NTP License',
                    osiApproved: true
                },
                'Nunit': {
                    name: 'Nunit License',
                    osiApproved: false
                },
                'OCLC-2.0': {
                    name: 'OCLC Research Public License 2.0',
                    osiApproved: true
                },
                'ODbL-1.0': {
                    name: 'ODC Open Database License v1.0',
                    osiApproved: false
                },
                'PDDL-1.0': {
                    name: 'ODC Public Domain Dedication & License 1.0',
                    osiApproved: false
                },
                'OGTSL': {
                    name: 'Open Group Test Suite License',
                    osiApproved: true
                },
                'OLDAP-2.2.2': {
                    name: 'Open LDAP Public License  2.2.2',
                    osiApproved: false
                },
                'OLDAP-1.1': {
                    name: 'Open LDAP Public License v1.1',
                    osiApproved: false
                },
                'OLDAP-1.2': {
                    name: 'Open LDAP Public License v1.2',
                    osiApproved: false
                },
                'OLDAP-1.3': {
                    name: 'Open LDAP Public License v1.3',
                    osiApproved: false
                },
                'OLDAP-1.4': {
                    name: 'Open LDAP Public License v1.4',
                    osiApproved: false
                },
                'OLDAP-2.0': {
                    name: 'Open LDAP Public License v2.0 (or possibly 2.0A and 2.0B)',
                    osiApproved: false
                },
                'OLDAP-2.0.1': {
                    name: 'Open LDAP Public License v2.0.1',
                    osiApproved: false
                },
                'OLDAP-2.1': {
                    name: 'Open LDAP Public License v2.1',
                    osiApproved: false
                },
                'OLDAP-2.2': {
                    name: 'Open LDAP Public License v2.2',
                    osiApproved: false
                },
                'OLDAP-2.2.1': {
                    name: 'Open LDAP Public License v2.2.1',
                    osiApproved: false
                },
                'OLDAP-2.3': {
                    name: 'Open LDAP Public License v2.3',
                    osiApproved: false
                },
                'OLDAP-2.4': {
                    name: 'Open LDAP Public License v2.4',
                    osiApproved: false
                },
                'OLDAP-2.5': {
                    name: 'Open LDAP Public License v2.5',
                    osiApproved: false
                },
                'OLDAP-2.6': {
                    name: 'Open LDAP Public License v2.6',
                    osiApproved: false
                },
                'OLDAP-2.7': {
                    name: 'Open LDAP Public License v2.7',
                    osiApproved: false
                },
                'OLDAP-2.8': {
                    name: 'Open LDAP Public License v2.8',
                    osiApproved: false
                },
                'OML': {
                    name: 'Open Market License',
                    osiApproved: false
                },
                'OPL-1.0': {
                    name: 'Open Public License v1.0',
                    osiApproved: false
                },
                'OSL-1.0': {
                    name: 'Open Software License 1.0',
                    osiApproved: true
                },
                'OSL-1.1': {
                    name: 'Open Software License 1.1',
                    osiApproved: false
                },
                'OSL-2.0': {
                    name: 'Open Software License 2.0',
                    osiApproved: true
                },
                'OSL-2.1': {
                    name: 'Open Software License 2.1',
                    osiApproved: true
                },
                'OSL-3.0': {
                    name: 'Open Software License 3.0',
                    osiApproved: true
                },
                'OpenSSL': {
                    name: 'OpenSSL License',
                    osiApproved: false
                },
                'PHP-3.0': {
                    name: 'PHP License v3.0',
                    osiApproved: true
                },
                'PHP-3.01': {
                    name: 'PHP License v3.01',
                    osiApproved: false
                },
                'Plexus': {
                    name: 'Plexus Classworlds License',
                    osiApproved: false
                },
                'PostgreSQL': {
                    name: 'PostgreSQL License',
                    osiApproved: true
                },
                'psfrag': {
                    name: 'psfrag License',
                    osiApproved: false
                },
                'psutils': {
                    name: 'psutils License',
                    osiApproved: false
                },
                'Python-2.0': {
                    name: 'Python License 2.0',
                    osiApproved: true
                },
                'QPL-1.0': {
                    name: 'Q Public License 1.0',
                    osiApproved: true
                },
                'Qhull': {
                    name: 'Qhull License',
                    osiApproved: false
                },
                'Rdisc': {
                    name: 'Rdisc License',
                    osiApproved: false
                },
                'RPSL-1.0': {
                    name: 'RealNetworks Public Source License v1.0',
                    osiApproved: true
                },
                'RPL-1.1': {
                    name: 'Reciprocal Public License 1.1',
                    osiApproved: true
                },
                'RPL-1.5': {
                    name: 'Reciprocal Public License 1.5',
                    osiApproved: true
                },
                'RHeCos-1.1': {
                    name: 'Red Hat eCos Public License v1.1',
                    osiApproved: false
                },
                'RSCPL': {
                    name: 'Ricoh Source Code Public License',
                    osiApproved: true
                },
                'RSA-MD': {
                    name: 'RSA Message-Digest License',
                    osiApproved: false
                },
                'Ruby': {
                    name: 'Ruby License',
                    osiApproved: false
                },
                'SAX-PD': {
                    name: 'Sax Public Domain Notice',
                    osiApproved: false
                },
                'Saxpath': {
                    name: 'Saxpath License',
                    osiApproved: false
                },
                'SCEA': {
                    name: 'SCEA Shared Source License',
                    osiApproved: false
                },
                'SWL': {
                    name: 'Scheme Widget Library (SWL) Software License Agreement',
                    osiApproved: false
                },
                'SGI-B-1.0': {
                    name: 'SGI Free Software License B v1.0',
                    osiApproved: false
                },
                'SGI-B-1.1': {
                    name: 'SGI Free Software License B v1.1',
                    osiApproved: false
                },
                'SGI-B-2.0': {
                    name: 'SGI Free Software License B v2.0',
                    osiApproved: false
                },
                'OFL-1.0': {
                    name: 'SIL Open Font License 1.0',
                    osiApproved: false
                },
                'OFL-1.1': {
                    name: 'SIL Open Font License 1.1',
                    osiApproved: true
                },
                'SimPL-2.0': {
                    name: 'Simple Public License 2.0',
                    osiApproved: true
                },
                'Sleepycat': {
                    name: 'Sleepycat License',
                    osiApproved: true
                },
                'SNIA': {
                    name: 'SNIA Public License 1.1',
                    osiApproved: false
                },
                'SMLNJ': {
                    name: 'Standard ML of New Jersey License',
                    osiApproved: false
                },
                'SugarCRM-1.1.3': {
                    name: 'SugarCRM Public License v1.1.3',
                    osiApproved: false
                },
                'SISSL': {
                    name: 'Sun Industry Standards Source License v1.1',
                    osiApproved: true
                },
                'SISSL-1.2': {
                    name: 'Sun Industry Standards Source License v1.2',
                    osiApproved: false
                },
                'SPL-1.0': {
                    name: 'Sun Public License v1.0',
                    osiApproved: true
                },
                'Watcom-1.0': {
                    name: 'Sybase Open Watcom Public License 1.0',
                    osiApproved: true
                },
                'TCL': {
                    name: 'TCL/TK License',
                    osiApproved: false
                },
                'Unlicense': {
                    name: 'The Unlicense',
                    osiApproved: false
                },
                'TMate': {
                    name: 'TMate Open Source License',
                    osiApproved: false
                },
                'TORQUE-1.1': {
                    name: 'TORQUE v2.5+ Software License v1.1',
                    osiApproved: false
                },
                'TOSL': {
                    name: 'Trusster Open Source License',
                    osiApproved: false
                },
                'Unicode-TOU': {
                    name: 'Unicode Terms of Use',
                    osiApproved: false
                },
                'UPL-1.0': {
                    name: 'Universal Permissive License v1.0',
                    osiApproved: true
                },
                'NCSA': {
                    name: 'University of Illinois/NCSA Open Source License',
                    osiApproved: true
                },
                'Vim': {
                    name: 'Vim License',
                    osiApproved: false
                },
                'VOSTROM': {
                    name: 'VOSTROM Public License for Open Source',
                    osiApproved: false
                },
                'VSL-1.0': {
                    name: 'Vovida Software License v1.0',
                    osiApproved: true
                },
                'W3C-19980720': {
                    name: 'W3C Software Notice and License (1998-07-20)',
                    osiApproved: false
                },
                'W3C': {
                    name: 'W3C Software Notice and License (2002-12-31)',
                    osiApproved: true
                },
                'Wsuipa': {
                    name: 'Wsuipa License',
                    osiApproved: false
                },
                'Xnet': {
                    name: 'X.Net License',
                    osiApproved: true
                },
                'X11': {
                    name: 'X11 License',
                    osiApproved: false
                },
                'Xerox': {
                    name: 'Xerox License',
                    osiApproved: false
                },
                'XFree86-1.1': {
                    name: 'XFree86 License 1.1',
                    osiApproved: false
                },
                'xinetd': {
                    name: 'xinetd License',
                    osiApproved: false
                },
                'xpp': {
                    name: 'XPP License',
                    osiApproved: false
                },
                'XSkat': {
                    name: 'XSkat License',
                    osiApproved: false
                },
                'YPL-1.0': {
                    name: 'Yahoo! Public License v1.0',
                    osiApproved: false
                },
                'YPL-1.1': {
                    name: 'Yahoo! Public License v1.1',
                    osiApproved: false
                },
                'Zed': {
                    name: 'Zed License',
                    osiApproved: false
                },
                'Zend-2.0': {
                    name: 'Zend License v2.0',
                    osiApproved: false
                },
                'Zimbra-1.3': {
                    name: 'Zimbra Public License v1.3',
                    osiApproved: false
                },
                'Zimbra-1.4': {
                    name: 'Zimbra Public License v1.4',
                    osiApproved: false
                },
                'Zlib': {
                    name: 'zlib License',
                    osiApproved: true
                },
                'zlib-acknowledgement': {
                    name: 'zlib/libpng License with Acknowledgement',
                    osiApproved: false
                },
                'ZPL-1.1': {
                    name: 'Zope Public License 1.1',
                    osiApproved: false
                },
                'ZPL-2.0': {
                    name: 'Zope Public License 2.0',
                    osiApproved: true
                },
                'ZPL-2.1': {
                    name: 'Zope Public License 2.1',
                    osiApproved: false
                }
            };
        }

        return {
            getLicenses: getLicenses
        }
    }]);