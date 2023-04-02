echo "👁 scaffolding local aws resources to localstack 👁"
aws --endpoint-url http://localhost:4566 s3 mb s3://blobs
aws --endpoint-url http://localhost:4566 s3 mb s3://blob-pointers
aws --endpoint-url http://localhost:4566 s3 mb s3://whoami
aws --endpoint-url http://localhost:4566 s3 ls
aws --endpoint-url http://localhost:4566 ses verify-email-identity --email-address no-reply@cryp.sh
echo "👁 done. 👁"