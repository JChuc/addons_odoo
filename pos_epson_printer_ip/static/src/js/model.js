odoo.define('pos_epson_printer_ip.models', function (require)=>{
"use strict";
const { load_fields } = require('point_of_sale.models');
load_fields('pos.config',['epson_printer_ip']);
});