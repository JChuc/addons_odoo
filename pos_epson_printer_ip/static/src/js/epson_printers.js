odoo.define('pos_epson_printer_ip.epson_printers', function (require) {
"use strict";

var Session = require('web.session');
var core = require('web.core');
var gui = require('point_of_sale.gui');
var mixins = require('web.mixins');
var _t = core._t;
var PrinterMixin = {
    init: function () {
        this.receipt_queue = [];
    },

    /**
     * Add the receipt to the queue of receipts to be printed and process it.
     * @param {String} receipt: The receipt to be printed, in HTML
     */
    /*print_receipt: function (receipt) {
        var self = this;
        console.log("printermixin");
        if (receipt) {
            this.receipt_queue.push(receipt);
        }
        function process_next_job() {
            if (self.receipt_queue.length > 0) {
                var r = self.receipt_queue.shift();
                try {
                    self.htmlToImg(r);
                    self.send_printing_job.bind(self);
                }
                catch (e) {
                    console.error(e.name);
                    console.error(e.message);
                }
                return self.htmlToImg(r)
                    .then(self.send_printing_job.bind(self))
                    .then(process_next_job)
            }
        }
        return process_next_job();
    },*/

    /**
     * Generate a jpeg image from a canvas
     * @param {DOMElement} canvas
     */
    /*process_canvas: function (canvas) {
        return canvas.toDataURL('image/jpeg').replace('data:image/jpeg;base64,','');
    },*/
    send_printing_job: function () {
        console.log("METODO SEND_PRINTING");
        if (this.printer) {
            this.printer.send();
            console.log("enviando impresion");
            return {
                result: true
            };
        }
    },
    /**
     * Renders the html as an image to print it
     * @param {String} receipt: The receipt to be printed, in HTML
     */
    htmlToImg: function (receipt) {
        var self = this;
        var ticket ="<div class='pos-receipt'>Hola esto es una prueba de impresion</div>";
        $('.pos-receipt-print').html(receipt);
        console.log("entro a htmlToImg");
        var promise = new Promise(function (resolve, reject) {
            /*self.receipt = $('.pos-receipt-print> .pos-receipt');*/
            self.receipt = $('.pos-receipt-print> .pos-receipt');
            html2canvas(self.receipt[0]).then(function (canvas){
                $('.pos-receipt-print').empty();
                resolve(self.process_canvas(canvas));
            });
            /*html2canvas(self.receipt[0], {
                onparsed: function(queue) {
                    console.log("onparsed");
                    queue.stack.ctx.height = Math.ceil(self.receipt.outerHeight() + self.receipt.offset().top);
                },
                onrendered: function (canvas) {
                    $('.pos-receipt-print').empty();
                    resolve(self.process_canvas(canvas));
                }
            })*/
        });
        return promise;
    },

    _onIoTActionResult: function (data){
        if (this.pos && (data === false || data.result === false)) {
            this.pos.gui.show_popup('error',{
                'title': _t('Connection to the printer failed'),
                'body':  _t('Please check if the printer is still connected.'),
            });
        }
    },

    _onIoTActionFail: function () {
        if (this.pos) {
            this.pos.gui.show_popup('error',{
                'title': _t('Connection to IoT Box failed'),
                'body':  _t('Please check if the IoT Box is still connected.'),
            });
        }
    },
}

var Printer = core.Class.extend(PrinterMixin, {
    init: function (url, pos) {
        PrinterMixin.init.call(this, arguments);
        this.pos = pos;
        this.connection = new Session(undefined, url || 'http://localhost:8069', { use_cors: true});
    },
    send_printing_job: function (img) {
        console.log("printer print_receiptxml")
        return this.connection.rpc('/hw_proxy/xml_receipt', {
            data: {
                action: 'print_receipt',
                receipt: img,
            }
        });
    },
});
return {
    PrinterMixin: PrinterMixin,
}
});