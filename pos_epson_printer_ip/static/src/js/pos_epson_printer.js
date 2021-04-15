odoo.define('pos_epson_printer_ip.pos_epson_printer', function (require) {
"use strict";
var models = require('point_of_sale.models');
var EpsonPrinter = require('pos_epson_printer_ip.Printer');
var posmodel_super = models.PosModel;

models.load_fields('pos.config',['other_devices','epson_printer_ip']);

models.PosModel = models.PosModel.extend({
    after_load_server_data: function () {
        var self = this;
        console.log(self.config.epson_printer_ip);
        if (self.config.other_devices && self.config.epson_printer_ip) {
                      self.proxy.printer = new EpsonPrinter(self.config.epson_printer_ip , self);
        }
        posmodel_super.prototype.after_load_server_data.apply(this,arguments);
        return function () {
                   if (self.config.other_devices && self.config.epson_printer_ip) {
                      self.proxy.printer = new EpsonPrinter(self.config.epson_printer_ip , self);
                   }
                   console.log(self.proxy.printer);
            };
        },
    });

});