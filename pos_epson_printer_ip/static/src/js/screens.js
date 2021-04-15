odoo.define('pos_epson_printer_ip.screens', function (require){
"use strict";

var screens =require('point_of_sale.screens');
var gui = require('point_of_sale.gui');
var core = require('web.core');
var QWeb = core.qweb;
var _t = core._t;

screens.ReceiptScreenWidget.include({
    print_xml: function() {
        var receipt = QWeb.render('XmlReceipt', this.get_receipt_render_env());
        console.log(this.pos.proxy);
        this.printer.print_receipt(receipt);
        console.log(this.pos.proxy);
        this.pos.get_order()._printed = true;
    },
    print_html: function () {
        var receipt = QWeb.render('OrderReceipt', this.get_receipt_render_env());
        console.log(this.pos.proxy.printer);
        this.pos.proxy.printer.print_receipt(receipt);
        this.pos.get_order()._printed = true;
    },
    print: function(){
        var self = this;
        console.log("Pagos proxy");
        console.log(this.pos.printer);
        if (!this.pos.proxy) { // browser (html) printing

            // The problem is that in chrome the print() is asynchronous and doesn't
            // execute until all rpc are finished. So it conflicts with the rpc used
            // to send the orders to the backend, and the user is able to go to the next
            // screen before the printing dialog is opened. The problem is that what's
            // printed is whatever is in the page when the dialog is opened and not when it's called,
            // and so you end up printing the product list instead of the receipt...
            //
            // Fixing this would need a re-architecturing
            // of the code to postpone sending of orders after printing.
            //
            // But since the print dialog also blocks the other asynchronous calls, the
            // button enabling in the setTimeout() is blocked until the printing dialog is
            // closed. But the timeout has to be big enough or else it doesn't work
            // 1 seconds is the same as the default timeout for sending orders and so the dialog
            // should have appeared before the timeout... so yeah that's not ultra reliable.

            this.lock_screen(true);

            setTimeout(function(){
                self.lock_screen(false);
            }, 1000);

            this.print_web();
        } else {    // proxy (xml) printing
            this.print_html();
            this.lock_screen(false);
        }
    }
});

});