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
	jsonLDContext = "https://raw.githubusercontent.com/Tribes-Dapp/identity/main/utils/schema/KYC_Tribes_Creator.jsonld" // JSONLD schema for credential
	typ           = "tribesIdentityCreator"                     // credential type
	fieldName     = "influency"                              // field name in form of field.field2.field3 field must be present in the credential subject
	schemaJSONLD  = `{
    "@context": [
        {
            "@protected": true,
            "@version": 1.1,
            "id": "@id",
            "type": "@type",
            "tribesIdentityCreator": {
                "@context": {
                    "@propagate": true,
                    "@protected": true,
                    "polygon-vocab": "urn:uuid:32415587-832a-4eb2-83b7-a49e1cc65e0d#",
                    "xsd": "http://www.w3.org/2001/XMLSchema#",
                    "majority": {
                        "@id": "polygon-vocab:majority",
                        "@type": "xsd:double"
                    },
                    "influency": {
                        "@id": "polygon-vocab:influency",
                        "@type": "xsd:boolean"
                    }
                },
                "@id": "urn:uuid:c5afb7c8-a615-4814-b54e-8c7fa5c33f29"
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
