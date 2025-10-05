from collections import OrderedDict
from fastapi import FastAPI
import yaml

app = FastAPI(debug=True)

def represent_ordereddict(dumper, data):
    return dumper.represent_mapping('tag:yaml.org,2002:map', data.items())

yaml.add_representer(OrderedDict, represent_ordereddict)
