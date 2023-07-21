export DATAPATH=/home/radhakrishna/Documents/satdata/e06data/1/ 
echo $DATAPATH
gdalbuildvrt -separate $DATAPATH/STAC.vrt  NETCDF:$DATAPATH/BAND.nc
gdal_translate -a_srs EPSG:4326 $DATAPATH/STAC.vrt -of 'Gtiff' $DATAPATH/band.tif