BUCKET_NAME=furizu-dev
ENDPOINT_URL=https://fly.storage.tigris.dev
aws s3api put-bucket-cors \
    --bucket $BUCKET_NAME \
    --cors-configuration '{"CORSRules" : [{"AllowedHeaders":["*"],"AllowedMethods":["PUT", "POST", "DELETE"],"AllowedOrigins":["https://furizu.cc", "http://localhost:5173"],"MaxAgeSeconds":3000}, {"AllowedHeaders":["*"],"AllowedMethods":["GET"],"AllowedOrigins":["*"],"MaxAgeSeconds":3000}]}' \
    --endpoint-url "$ENDPOINT_URL"
