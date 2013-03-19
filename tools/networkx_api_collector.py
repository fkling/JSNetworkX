import networkx as nx
from types import ModuleType, FunctionType, ClassType
import json

API = {
    "modules": set(),
    "functions": set(),
    "types": set(),
}

def clean_module_name(name):
    if 'function' in name:
        name = name.replace('function', 'func')
    if 'classes' in name and not 'func' in name:
        # trim module name
        name = name[0:name.rindex('.')]
    return name.replace('networkx', 'jsnx')

exclude = set(['setup_module', 'teardown_module'])

def inspect_module(API, m):
    for k, v in m.__dict__.iteritems():
        if isinstance(v, ModuleType):
            name = clean_module_name(v.__name__)
            if not name.startswith('jsnx'):
                continue
            if name not in API["modules"]:
                API["modules"].add(name)
                inspect_module(API, v)
        elif (type(v) == type or isinstance(v, ClassType)) and v.__module__.startswith('networkx'):
            module = clean_module_name(v.__module__)
            name = v.__name__
            t = (module, name, name in  nx.__dict__ and clean_module_name(nx.__dict__[name].__module__) == module)
            if t not in API["types"]:
                API["types"].add(t)
        elif isinstance(v, FunctionType) and v.__module__.startswith('networkx') and v.__name__ not in exclude:
            module = clean_module_name(v.__module__)
            name = v.__name__
            t = (module, name, name in  nx.__dict__ and clean_module_name(nx.__dict__[name].__module__) == module)
            # ignore private functions
            if not name.startswith('_') and t not in API["functions"]:
                API["functions"].add(t)

inspect_module(API, nx)

API['modules'] = sorted(API['modules'])
API['functions'] = sorted(API['functions'], key=lambda x: x[1])
API['types'] = sorted(API['types'], key=lambda x: x[1]);

print json.dumps(API)
