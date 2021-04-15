{
    'name': 'pos_epson_printer_ip',
    'version': '12.0.1',
    'summary': '',
    'description': '',
    'category': '',
    'author': '',
    'website': '',
    'license': '',
    'depends': ['point_of_sale'],
    'data': [
        'views/point_of_sale_assets.xml',
        'views/pos_config.xml',
    ],
    'qweb': ["static/src/xml/pos.xml"],
    'installable': True,
    'application': True,
}