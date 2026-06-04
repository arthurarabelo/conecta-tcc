<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KnowledgeArea;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KnowledgeAreaController extends Controller
{
    private const SORTABLE = ['id', 'name'];

    public function index(Request $request): JsonResponse
    {
        $sortBy = in_array($request->query('sort_by'), self::SORTABLE, true)
            ? $request->query('sort_by')
            : 'name';

        $order = $request->query('order', 'asc') === 'desc' ? 'desc' : 'asc';

        return response()->json(KnowledgeArea::orderBy($sortBy, $order)->get());
    }
}
