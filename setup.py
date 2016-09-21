# -*- coding: utf-8 -*-
from setuptools import setup, find_packages  # Always prefer setuptools over distutils
from codecs import open  # To use a consistent encoding
from os import path

here = path.abspath(path.dirname(__file__))

# Get the long description from the relevant file
with open(path.join(here, 'README.md'), encoding='utf-8') as f:
    long_description = f.read()


setup(
    name='faustplayground',
    version='0.0.1',
    description='Play Faust on your browser',
    long_description=long_description,

    author='Ève Ribodie & All Tou gay Zeur',

    packages=find_packages('py'),
    package_dir={'': 'py'},

    install_requires=['twisted',
                      'autobahn',
                      'pyopenssl'],
)
