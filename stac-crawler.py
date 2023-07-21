import shutil
import tempfile
from pathlib import Path

from pystac import Catalog, get_stac_version

stacurl='https://earth-search.aws.element84.com/v1/'

root_catalog = Catalog.from_file(stacurl)

print(f"ID: {root_catalog.id}")
print(f"Title: {root_catalog.title or 'N/A'}")
# collections = list(root_catalog.get_collections())
# print(f"Number of collections: {len(collections)}")

collection_name='sentinel-2-l2a'
collection = root_catalog.get_child(collection_name)
assert collection is not None

items = list(collection.get_items(recursive=True))

print(f"Number of items: {len(items)}")
for item in items:
    print(f"- {item.id}")