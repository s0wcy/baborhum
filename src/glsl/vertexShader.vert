vertexNormal_cameraspace = MV3x3 * normalize(vertexNormal_modelspace);
vertexTangent_cameraspace = MV3x3 * normalize(vertexTangent_modelspace);
vertexBitangent_cameraspace = MV3x3 * normalize(vertexBitangent_modelspace);