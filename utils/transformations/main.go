// You can edit this code!
// Click here and start typing.
package main

import (
	"fmt"
	"log"

	"github.com/iden3/go-schema-processor/merklize"
	"github.com/iden3/go-schema-processor/utils"
)

const (
	jsonLDContext = "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld" // JSONLD schema for credential
	typ           = "tribesIdentity"                                                                               // credential type
	fieldName     = "age"                                                                                       // field name in form of field.field2.field3 field must be present in the credential subject
	schemaJSONLD  = `{
    "@context": [
      {
        "@protected": true,
        "@version": 1.1,
        "id": "@id",
        "type": "@type",
        "tribesIdentity": {
          "@context": {
            "@propagate": true,
            "@protected": true,
            "polygon-vocab": "urn:uuid:f86414ac-0b34-4da4-b7f8-d74ca74328b1#",
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            "majority": {
              "@id": "polygon-vocab:majority",
              "@type": "xsd:double"
            }
          },
          "@id": "urn:uuid:eeff0142-f6f5-4895-91a3-89536fdd7447"
        }
      }
    ]
  }`
)

func main() {

	// content of json ld schema

	schemaID := fmt.Sprintf("%s#%s", jsonLDContext, typ)
	querySchema := utils.CreateSchemaHash([]byte(schemaID))
	fmt.Println("Schema hash:")
	fmt.Println(querySchema.BigInt().String())
	path, err := merklize.NewFieldPathFromContext([]byte(schemaJSONLD), typ, fieldName)
	if err != nil {
		log.Fatal(err)
	}
	err = path.Prepend("https://www.w3.org/2018/credentials#credentialSubject")
	if err != nil {
		log.Fatal(err)
	}
	mkPath, err := path.MtEntry()
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Claim path key:")
	fmt.Println(mkPath.String())
}
