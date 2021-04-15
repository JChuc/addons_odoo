{
    'name': 'POS PRODUCT WEIGHT',
    'version': '13.0.1.0.2',
    "application": False,
    'summary': 'Agregar mensaje de texto',
    'description': 'Agregar una pantalla para ingresar la cantidad del producto',
    'category': 'Point of sale',
    'author': 'Jchuc',
    'website': 'Website',
    'license': 'AGPL-3',
    'depends': ['point_of_sale'],
    'data': [
        'views/assets.xml',
    ],
    "qweb": ['static/src/xml/screens.xml'],
    'demo': [],
    'installable': True,
}
