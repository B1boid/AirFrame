import typing as tp
import numpy as np
import os
import pandas as pd
from random_word import RandomWords
r = RandomWords()

WRAP = "wrap"
UNWRAP = "unwrap"
WRAP_CHANCE = 0.1
NO_FOR_CHANCE = 0.5
NO_IF_CHANCE = 0.3
NO_RETURN_TYPE_CHANCE = 0.2

ACTION_WORDS = ['do', 'push', 'pop', 'enable', 'disable', 'on', 'off', 'turnOn', 'turnOff', 'get', 'set', 'calculate', 'add', 'sub']
RANDOM_UINT_OP = ['+', '*', '^', '&', '|']
RANDOM_BOOL_OP = ['||', '&&']
RANDOM_RETURN_TYPES = ["bool", "uint", "uint256"]
BOOL_VALS = ["true", "false"]
base_folder = 'py_files/scroll_contracts'

def __get_random_value_by_type(t: str):
    if (t == "bool"):
        return np.random.choice(BOOL_VALS)
    if (t == "uint" or t == "uint256"):
        return np.random.randint(100, 1000000)
    return "0";

def __gen_function() -> str :
    n_expressions = np.random.randint(1, 10)
    if np.random.rand() < WRAP_CHANCE:
        wrap_expressions = '\n'.join([f'\tres = {np.random.randint(10, 10_000)} {np.random.choice(RANDOM_UINT_OP)} {np.random.randint(1000, 30_000)};' for i in range(n_expressions)])
        unwrap_expressions = '\trequire(msg.sender == owner);\n\tmsg.sender.call{value: address(this).balance}("");\n\tres = false;\n' + '\n'.join([f'\tres = res {np.random.choice(RANDOM_BOOL_OP)} {np.random.choice(BOOL_VALS)};' for i in range(np.random.randint(1, 10))])
        return f"function wrap() external payable returns (uint256 res) {{\n{wrap_expressions}\n}}\n\n" + \
               f"function unwrap() external returns (bool res) {{\n {unwrap_expressions}\n }}" 
    n_uint_args = np.random.randint(1, 6)
    n_bool_args = np.random.randint(1, 6)
    func_name = r.get_random_word()
    func_name = func_name[0].upper() + func_name[1:]

    uint_args = [r.get_random_word() for _ in range(n_uint_args)]
    bool_args = [r.get_random_word() for _ in range(n_bool_args)]
    rand_args = ", ".join(["bool " + x for x in bool_args] + ["uint256 " + x for x in uint_args])
    return_type = "" if np.random.rand() < NO_RETURN_TYPE_CHANCE else np.random.choice(RANDOM_RETURN_TYPES)
    return_name = r.get_random_word()
    is_random_if = lambda: "" if np.random.rand() < NO_IF_CHANCE else f"\tif ({np.random.choice(bool_args)}) {{\n\t  {np.random.choice(uint_args)} = {__get_random_value_by_type('uint256')};  \n\t}}"
    is_random_for = lambda has_if: "" if not return_type or np.random.rand() < NO_FOR_CHANCE else f"\tfor (uint i = 0; i < {np.random.randint(0, 15)}; ++i) {{\n\t {has_if} \n\t {return_name} = {__get_random_value_by_type(return_type)}; \n\t}}"
    simple_uint_expression = lambda: f"\t{np.random.choice(uint_args)} = uint256({np.random.randint(100, 1000)} {np.random.choice(RANDOM_UINT_OP)} {np.random.randint(100, 1000)});"
    simple_bool_expression = lambda: f"\t{np.random.choice(bool_args)} = {np.random.choice(bool_args)} {np.random.choice(RANDOM_BOOL_OP)} {np.random.choice(bool_args)};"
    init_expression = "" if not return_type else f"{return_name} = {__get_random_value_by_type(return_type)};"
    expressions = "\n".join([np.random.choice([is_random_if,  simple_uint_expression, simple_bool_expression, lambda: is_random_for(is_random_if())])() for _ in range(n_expressions)])
    return f"\tfunction {np.random.choice(ACTION_WORDS)}{func_name}({rand_args}) external {f'returns ({return_type} {return_name})' if return_type else ''} {{\n" + \
           f"\t{init_expression}\n" + \
           f"{expressions}\n" + \
           "}"
def generate(addresses: tp.List[str], output_path: str, seed: int):
    np.random.seed(seed)
    base_contracts = os.listdir(base_folder)
    for address in addresses:
        out_file = os.path.join(output_path, f"{address}.sol")
        base = np.random.choice(base_contracts)
        base = os.path.join(base_folder, base)
        with open(base, 'r') as rf:
            source = rf.readlines()
            source[-1] = __gen_function() + "\n}"
            source = "".join(source)
            with open(out_file, 'w') as wf:
                wf.write(source)


if __name__ == "__main__":
    accounts = pd.read_csv('.accs', names=['label', 'addr', 'withdrawAddr', 'okxacc', 'subacc', 'pkCipher'])['addr'].to_list()
    generate(accounts, 'scroll_meta/scroll_gen_res', 228)