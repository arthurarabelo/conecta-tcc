<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    private const SORTABLE = ['id', 'name', 'code'];

    public function index(Request $request): JsonResponse
    {
        $sortBy = in_array($request->query('sort_by'), self::SORTABLE, true)
            ? $request->query('sort_by')
            : 'name';

        $order = $request->query('order', 'asc') === 'desc' ? 'desc' : 'asc';

        return response()->json(Department::orderBy($sortBy, $order)->get());
    }
}
