from odoo import api, fields, models

class Pos_Config(models.Model):
    _inherit = "pos.config"


    other_devices = fields.Boolean(string="Other Devices", help="Connect devices to your PoS without an IoT Box.")
    epson_printer_ip = fields.Char(string="Epson Printer IP", help="Local IP address of an Epson receipt printer.")


    @api.onchange('epson_printer_ip')
    def _onchange_epson_printer_ip(self):
        if self.epson_printer_ip in (False,''):
            self.iface_cashdrawer = False