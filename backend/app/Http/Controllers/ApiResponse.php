<?php

namespace App\Http\Controllers;

trait ApiResponse
{
    protected function success($data = null, string $message = '', int $status = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    protected function error(string $message, ?array $errors = null, int $status = 400)
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];
        if ($errors) {
            $response['errors'] = $errors;
        }
        return response()->json($response, $status);
    }

    protected function paginated($paginator, string $message = '')
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $paginator->items(),
            'meta' => [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }
}
